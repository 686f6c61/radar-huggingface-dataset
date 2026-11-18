# 22f3001411/surfaceguard-mit-b4-two-seed

## Resumen

SurfaceGuard AI - MiT-B4 Two-Seed Model es un modelo de segmentacion semantica de imagenes orientado a la inspeccion industrial, concretamente a la deteccion de defectos superficiales en acero. Lo publica el usuario 22f3001411 en Hugging Face y esta implementado con la libreria Segmentation Models PyTorch, usando una arquitectura SegFormer con encoder MiT-B4. El repositorio contiene dos checkpoints entrenados con semillas aleatorias distintas (42 y 2026) que pueden promediarse en inferencia para reducir la varianza de prediccion.

El modelo resuelve un problema acotado: dada una imagen RGB de una superficie de acero, segmenta cuatro clases de defecto (defect_a, defect_b, defect_c y defect_d) a una resolucion de entrada de 128 x 800 pixeles. No es un modelo de proposito general ni un modelo de lenguaje: es un segmentador denso de cuatro clases, pensado para experimentos educativos e investigacion en segmentacion de defectos superficiales.

Su relevancia es limitada y local: no tiene descargas ni likes, no declara licencia ni idiomas, y el propio autor advierte que debe validarse antes de usarse en un sistema de control de calidad en produccion. La informacion publica disponible es escasa y se limita a la model card y a los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (encoder MiT-B4) sobre Segmentation Models PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada fija de 128 x 800 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pth` (`mit_b4_seed_42_best.pth`, `mit_b4_seed_2026_best.pth`) |
| Clases de salida | defect_a, defect_b, defect_c, defect_d |
| Resolucion de entrada | 128 x 800 px, RGB, normalizacion ImageNet |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema SegFormer: un encoder transformer jerarquico MiT-B4 que extrae caracteristicas multiescala y un decodificador ligero de segmentacion semantica que produce el mapa de clases por pixel. La implementacion concreta proviene de Segmentation Models PyTorch, lo que implica que la cabeza de decodificacion y la inicializacion siguen los valores por defecto de esa libreria.

Se han entrenado dos checkpoints independientes con semillas 42 y 2026, y la model card recomienda promediar sus predicciones en inferencia para reducir la varianza. El pipeline de inferencia propuesto incluye test-time augmentation con flip horizontal (prediccion, flip, prediccion sobre la imagen volteada, inversion del flip y promedio de las dos semillas), seguido de umbralizacion por clase, filtrado de componentes conexos y codificacion RLE. Los umbrales y areas minimas indicados son: defect_a 0,225 y 64 px; defect_b 0,200 y 16 px; defect_c 0,225 y 32 px; defect_d 0,225 y 96 px. No se especifica el volumen de datos de entrenamiento, la composicion del dataset, el numero de epochs ni si se aplicaron tecnicas de aumento mas alla del TTA descrito.

## Capacidades

- Segmentacion semantica densa de imagenes RGB de superficies de acero en cuatro clases de defecto.
- Prediccion por pixel con resolucion de entrada fija de 128 x 800 px.
- Ensemble de dos semillas mediante promedio de predicciones, con el objetivo de reducir la varianza.
- Test-time augmentation con flip horizontal integrado en el pipeline recomendado.
- Post-procesado configurable por clase: umbralizacion, filtrado de componentes conexos y codificacion RLE.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, vision general, audio ni capacidades multilingues.

## Casos de uso

- Inspeccion de defectos en linea de laminacion: el modelo segmenta las cuatro clases de defecto sobre imagenes de superficie de acero a 128 x 800 px, permitiendo localizar y medir areas defectuosas por clase con los umbrales y areas minimas definidos.
- Investigacion academica en segmentacion de defectos superficiales: sirve como baseline SegFormer MiT-B4 reproducible, con dos semillas documentadas, para comparar arquitecturas o estrategias de post-procesado.
- Experimentos de ensemble y TTA: el par de checkpoints permite estudiar el efecto del promedio de semillas y del flip horizontal sobre la estabilidad de las mascaras predichas.
- Prototipado de pipelines de control de calidad: el flujo completo (preprocesado, prediccion, TTA, umbral, componentes conexos, RLE) puede montarse como referencia para integrar un segmentador en una herramienta de inspeccion.
- Generacion de mascaras codificadas en RLE para anotacion asistida: las salidas RLE pueden usarse como preanotaciones que un operario revisa y corrige, acelerando el etiquetado de nuevos datasets.
- Evaluacion de umbrales por clase: los valores publicados (0,200-0,225) y las areas minimas (16-96 px) permiten experimentar con el compromiso entre falsos positivos y falsos negativos en cada tipo de defecto.
- Docencia en vision por computador industrial: ejemplo completo de segmentacion semantica con Segment Models PyTorch, incluyendo preprocesado con estadisticas ImageNet y post-procesado morfologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las puntuaciones reportadas son mediciones locales de validacion o auditoria y que no deben interpretarse como puntuaciones oficiales de la competicion Kaggle salvo verificacion independiente en la plataforma; sin embargo, no se incluyen los valores numericos de dichas mediciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,5 GB) sugiere que cada checkpoint ocupa del orden de 0,2-0,25 GB, pero no se confirma el numero de parametros.
- GPU recomendadas: no disponible. Al ser un modelo de vision de entrada pequena (128 x 800 px), es probable que quepa en GPU consumer, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: PyTorch con Segmentation Models PyTorch (unica libreria declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurfaceGuard MiT-B4 Two-Seed | SegFormer MiT-B4 (SMP) | no disponible | 128 x 800 px | no disponible | Hugging Face, 0 descargas |
| SegFormer MiT-B4 (original) | SegFormer | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Publico |
| U-Net (SMP) | CNN encoder-decoder | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Publico |

No se dispone de datos de rendimiento del modelo como para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a la arquitectura y a la disponibilidad.

## Limitaciones y advertencias

- El propio autor indica que el modelo esta pensado para experimentos educativos e investigacion y que debe validarse adicionalmente antes de usarse en un sistema de control de calidad en produccion.
- Las puntuaciones reportadas son mediciones locales de validacion o auditoria; no deben interpretarse como resultados oficiales de Kaggle salvo verificacion independiente.
- No se declara licencia, por lo que el uso comercial queda sin marco legal explicito y debe consultarse con el autor.
- No se documentan sesgos, pero al ser un modelo entrenado sobre un dataset industrial concreto, probablemente generaliza mal a otras condiciones de iluminacion, camara, material o tipos de defecto no representados.
- Riesgo de alucinacion entendido como falsos positivos de segmentacion: el pipeline depende de umbrales y areas minimas fijas por clase, calibradas para un dominio concreto.
- La resolucion de entrada es fija (128 x 800 px) y muy baja en el eje vertical, lo que limita la deteccion de defectos finos.
- Solo cuatro clases de defecto, sin clase de fondo explicita documentada ni jerarquia de severidad.
- No hay informacion sobre el dataset de entrenamiento, el numero de imagenes ni el reparto train/val/test, lo que impide evaluar la solidez de las metricas.
- Cero descargas y cero likes: no existe validacion externa por parte de la comunidad.
- No aplica a tareas de texto, codigo, agentes ni dialogos; usarlo fuera de la segmentacion de defectos superficiales no tiene sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/22f3001411/surfaceguard-mit-b4-two-seed
- Segmentation Models PyTorch: https://github.com/qubvel-org/segmentation_models_pytorch
- SegFormer (paper original): https://arxiv.org/abs/2105.15203
- No se han encontrado otros enlaces (papers, blogs, repos o demos) asociados a este modelo en la informacion disponible.
