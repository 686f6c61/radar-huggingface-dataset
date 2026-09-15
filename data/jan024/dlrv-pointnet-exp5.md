# jan024/dlrv-pointnet-exp5

## Resumen

dlrv-pointnet-exp5 es un estimador de pose 6DoF de objetos entrenado por el usuario jan024 para el proyecto «Deep Learning for Robot Vision» de la Hochschule Bonn-Rhein-Sieg. Se trata de un modelo de visión 3D, no de un modelo de lenguaje: recibe una nube de puntos enmascarada de un único objeto y regresa su pose completa (rotación y traslación) en el espacio de la cámara. Está especializado en los quince objetos del dataset LineMOD y se distribuye como checkpoint de PyTorch con 0,86 millones de parámetros.

El problema que resuelve es la estimación de pose de objetos rígidos, pieza central de tareas de manipulación robótica, bin picking y verificación de montaje. Su rasgo técnico más relevante es la elección de representaciones que evitan discontinuidades: la rotación se predice en la representación continua de 6D de Zhou et al. en lugar de cuaterniones o ángulos de Euler, y la traslación se predice como residuo respecto al centroide de la nube observada en lugar de como posición absoluta, algo necesario porque las capas de set abstraction de PointNet++ recentran cada vecindario local y destruyen la información posicional global.

El checkpoint corresponde a la configuración exp5, descrita por el autor como la más fuerte bajo el objetivo de entrenamiento subrogado y la empleada para la comparación directa contra la pista MVCNN del informe. Su limitación principal es la brecha simulación-realidad: se entrenó únicamente sobre el split sintético PBR, sin adaptación de dominio, y la precisión cae 21,1 puntos al evaluar sobre imágenes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (bloques de set abstraction SA1 a SA3) con cabeza de estimación de pose de dos ramas |
| Parametros totales | 0,86 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 1024 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (.pth); diccionario con las claves `epoch`, `val_add`, `backbone` y `pose_head` |
| Entrada | nube de puntos de 1024 puntos, en metros, centrada en el centroide |
| Salida | rotación (representación continua 6D) y traslación (residuo respecto al centroide) |
| Dataset de entrenamiento | LineMOD en formato BOP, únicamente split sintético PBR |
| Tarea (pipeline) | robotics |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo se compone de un backbone `PointNetPlusPlus` con bloques de set abstraction SA1 a SA3 sobre 1024 puntos de entrada, seguido de una cabeza `PoseEstimationHead` que proyecta a un vector de características de 512 dimensiones y alimenta dos ramas separadas, una para rotación y otra para traslación. La rama de rotación predice la representación continua 6D de Zhou et al., que evita las discontinuidades de cuaterniones y ángulos de Euler. La rama de traslación predice un residuo respecto al centroide de la nube observada, decisión justificada por el propio autor: como el set abstraction recentra cada vecindario local en su propio centroide, la posición absoluta no sobrevive hasta el descriptor global, de modo que predecir el residuo es lo que hace que la traslación sea aprendible.

El entrenamiento se realizó con la configuración `--experiment exp5_combined --epochs 30 --batch_size 32 --lr 0.001 --backbone_lr 0.0005 --rot_weight 1.0 --trans_weight 0.05`. El objetivo es subrogado: una pérdida geodésica de rotación más una pérdida L1 de traslación ponderada por `trans_weight`. Según el autor, multiplicar por cinco ese peso fue la palanca más efectiva del ablation, con una ganancia de +8,3 puntos, y compone con un learning rate del backbone cinco veces mayor para un total de +17,1 puntos sobre la línea base. No se aplicó adaptación de dominio: solo se usó el split sintético PBR. Existe una variante entrenada con ADD normalizado por diámetro, publicada como `jan024/dlrv-ppointnet-exp6`, más precisa en datos sintéticos y menos precisa en datos reales.

## Capacidades

- Regresión de pose 6DoF completa (rotación y traslación) de un objeto rígido a partir de una nube de puntos enmascarada.
- Especialización en los quince objetos del dataset LineMOD (catálogo cerrado de clases, `n_classes=15`).
- Manejo de la discontinuidad de representaciones rotacionales mediante la parametrización continua 6D.
- Predicción de traslación relativa al centroide, robusta frente al recentrado interno de PointNet++.
- Inferencia sobre nubes de puntos RGB-D enmascaradas, en metros.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora detección ni segmentación: requiere una máscara de objeto ground-truth como entrada.
- No dispone de modo «thinking», visión 2D nativa, audio ni otras capacidades multimodales más allá de la geometría 3D.

## Casos de uso

- Manipulación robótica con bin picking: dado el segmentado de una pieza en un contenedor desordenado, el modelo estima la pose 6DoF necesaria para planificar una pinza y un agarre sin colisiones. Es adecuado porque la predicción es relativa al centroide observado, lo que tolera que la nube esté parcialmente ocluida y descentrada.
- Verificación de montaje en línea de producción: comparar la pose estimada de una pieza con la pose nominal del CAD para detectar piezas mal orientadas o mal insertadas. El modelo es ligero (0,86 M de parámetros) y permite evaluación a alta cadencia.
- Calibración y registro de piezas sobre banco de trabajo: obtener la transformación rígida entre el objeto físico y su modelo CAD para tareas de inspección dimensional.
- Investigación académica en estimación de pose 6DoF: sirve como línea base reproducible y de muy bajo coste computacional para comparar contra arquitecturas más pesadas sobre LineMOD/BOP.
- Prototipado de pipelines de robot vision con restricciones de hardware: al ocupar unos pocos megabytes, se puede desplegar en GPUs modestas o incluso en CPU dentro de una celda robotizada.
- Estudio de la brecha simulación-realidad: el checkpoint documenta explícitamente la caída de 21,1 puntos entre validación sintética y test real, por lo que es útil como caso de análisis para técnicas de adaptación de dominio.
- Pipeline de datos sintéticos PBR: al haberse entrenado solo con renderizados, sirve para estudiar hasta qué punto la geometría sintética transfiere a sensores de profundidad reales, siempre que se disponga de máscaras ground-truth.
- Evaluación comparativa en el marco BOP: el script `src/pose/eval_test_set.py` permite reproducir el 36,23% de ADD(-S)@0,1d sobre las 3.000 imágenes del test real en unos dos minutos con una RTX A5000.

## Benchmarks y rendimiento

Resultados reportados por el autor. Métrica ADD(-S) con umbrales relativos al diámetro del objeto, más error de traslación en milímetros.

| Split | ADD(-S)@0,05d | ADD(-S)@0,1d | ADD(-S)@0,2d | Error medio | Error mediano |
|---|---|---|---|---|---|
| Validación sintética | no disponible | 57,36% | no disponible | no disponible | no disponible |
| Test real BOP (3.000 imágenes) | 8,17% | 36,23% | 60,20% | 43,82 mm | 26,95 mm |

Desglose por objeto en datos reales (parcial, según el autor): la lámpara alcanza el 61,0% y la perforadora el 5,0%. La precisión correlaciona fuertemente con el diámetro del objeto (Pearson r = +0,92 en datos reales), porque el umbral ADD es 0,1 × diámetro mientras que la precisión del modelo es absoluta y no relativa. No se dispone de resultados comparativos numéricos frente a la pista MVCNN del informe ni frente a `exp6`.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32. El checkpoint completo pesa del orden de unos pocos megabytes (0,86 M de parámetros), por lo que la huella de memoria es despreciable frente a cualquier otro componente del pipeline.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 4090, RTX 3090, A100, H100 y, por supuesto, la RTX A5000 empleada por el autor. También es viable en GPUs de gama baja o integradas.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta consumer moderna e incluso en modelos con poca VRAM.
- Ejecución en CPU: factible por el reducido tamaño del modelo, aunque la carga de datos y el preprocesado de nubes de puntos pueden dominar el tiempo total.
- Opciones de despliegue: al ser un checkpoint de PyTorch con definiciones de modelo propias (`pointnet.model.PointNetPlusPlus` y `pose.head.PoseEstimationHead`), no hay integración documentada con vLLM, llama.cpp, Ollama o TGI —herramientas orientadas a modelos de lenguaje—. El despliegue natural es Python con PyTorch, opcionalmente exportando a TorchScript o ONNX (no documentado por el autor).
- Latencia y throughput estimados: el autor reporta aproximadamente dos minutos para evaluar 3.000 imágenes en una RTX A5000, lo que equivale a unos 25 objetos por segundo en ese hardware y ese pipeline de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / clases | ADD(-S)@0,1d real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jan024/dlrv-pointnet-exp5 | 0,86 M | 1024 puntos, nube enmascarada | 15 objetos LineMOD | 36,23% | no disponible | HuggingFace |
| jan024/dlrv-ppointnet-exp6 | no disponible | 1024 puntos, nube enmascarada | 15 objetos LineMOD | no disponible | no disponible | HuggingFace |
| Pista MVCNN del informe (referencia citada, sin datos) | no disponible | no disponible | 15 objetos LineMOD | no disponible | no disponible | no disponible |

El autor indica que `exp6` es más preciso en datos sintéticos y menos preciso en datos reales que `exp5`, y que `exp5` es el checkpoint empleado para la comparación cara a cara contra la pista MVCNN, pero no se publican cifras de esa comparación en la información disponible. No se dispone de datos de otros estimadores de pose 6DoF de la literatura en el material consultado, por lo que no se incluye una comparación numérica adicional.

## Limitaciones y advertencias

- Sesgos: el modelo está entrenado exclusivamente sobre el split sintético PBR de LineMOD, con una apariencia y una densidad de sensores que no reproducen la distribución real. La caída de 21,1 puntos entre validación sintética y test real es la manifestación directa de ese sesgo de dominio.
- Riesgo de alucinación entendido como error de predicción: en objetos pequeños los fallos son graves, no marginales. El objeto «ape» obtiene un 14,5% en datos reales, según el autor.
- Requiere máscara ground-truth del objeto. No incluye ninguna etapa de detección ni de segmentación, por lo que no es un pipeline autónomo de extremo a extremo.
- Correlación con el diámetro: la precisión es absoluta mientras que el umbral ADD es relativo al diámetro (0,1 × diámetro), lo que produce una fuerte dependencia del tamaño del objeto (Pearson r = +0,92). Los objetos pequeños se penalizan de forma estructural.
- Reproducibilidad: la evaluación submuestrea la nube de puntos y los vértices del CAD sin semilla fija, de modo que las cifras por objeto varían unos pocos puntos entre ejecuciones.
- El dataset LineMOD en formato BOP no se distribuye con el modelo; debe descargarse por separado de https://bop.felk.cvut.cz/datasets/.
- Licencia: no disponible. No se especifican términos de uso comercial, por lo que no se puede asumir permiso para uso en producción sin consultar al autor.
- Estado del repositorio: 0 descargas y 0 «likes» en el momento de la consulta, tamaño de repositorio 0,0 GB y sin licencia declarada, lo que sugiere un artefacto académico sin mantenimiento ni soporte.
- Dependencia de código externo: para cargar el checkpoint se necesitan las definiciones de modelo del repositorio del proyecto, que no se incluyen en el modelo de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jan024/dlrv-pointnet-exp5
- Variante con ADD normalizado por diámetro (exp6): https://huggingface.co/jan024/dlrv-ppointnet-exp6
- Dataset LineMOD en formato BOP: https://bop.felk.cvut.cz/datasets/
- Búsqueda web: no se han encontrado resultados relevantes sobre el modelo, su paper o su repositorio. Las consultas devolvieron únicamente páginas del servicio Vinted sin relación alguna con el modelo. No se dispone de enlace a paper, blog, repositorio de código ni demo.
