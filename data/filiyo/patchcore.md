# Filiyo/patchcore

## Resumen

PatchCore es un modelo de deteccion de anomalias visuales basado en la metodologia PatchCore, publicado en Hugging Face bajo el identificador `Filiyo/patchcore`. El nombre hace referencia al conocido enfoque de deteccion de anomalias industriales introducido en el paper "Towards Total Recall in Industrial Anomaly Detection" (Roth et al., 2021), que combina caracteristicas locales extraidas de una red preentrenada con un banco de memoria de parches normales para detectar desviaciones. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere la inclusion de pesos de backbone y, probablemente, un banco de memoria de caracteristicas.

No se dispone de informacion sobre el pipeline, la licencia, los idiomas ni los resultados de benchmarks en los metadatos publicados. El modelo cuenta con 0 descargas y 1 like, lo que indica que se trata de una publicacion de perfil personal o experimental, sin traccion comunitaria ni documentacion publica asociada. La ficha que sigue recoge exclusivamente lo que puede inferirse de los metadatos disponibles y de la familia de modelos PatchCore, marcando explicitamente como "no disponible" cualquier dato no confirmado.

Dado que PatchCore no es un modelo generativo de lenguaje sino un sistema de deteccion de anomalias por comparacion de caracteristicas, las secciones de capacidades, casos de uso y requisitos de hardware se adaptan a ese perfil funcional en lugar de a un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deteccion de anomalias basada en banco de memoria de parches (familia PatchCore) |
| Parametros totales | no disponible (depende del backbone; el repo ocupa 0,1 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoints PyTorch; sin confirmar) |

## Arquitectura y entrenamiento

PatchCore, en su formulacion original, no entrena una red neuronal desde cero. Utiliza un backbone convolucional preentrenado (tipicamente WideResNet-50 con pesos de ImageNet) para extraer mapas de caracteristicas de parches locales, aplica un muestreo por nucleos para reducir la redundancia del banco de memoria y, en inferencia, calcula la distancia entre las caracteristicas de cada parche de la imagen de test y sus vecinos mas cercanos en el banco de memoria de imagenes normales. La puntuacion de anomalia deriva de esa distancia, y la localizacion se obtiene proyectando las distancias sobre el mapa espacial.

El repositorio concreto `Filiyo/patchcore` no documenta que backbone, que dataset de entrenamiento (por ejemplo MVTec AD, VisA o BTAD) ni que hiperparametros se han utilizado. Tampoco se especifica si se ha aplicado reentrenamiento, fine-tuning o si se trata de una exportacion de pesos ya entrenados. Toda esta informacion figura como no disponible.

## Capacidades

- Deteccion de anomalias visuales en imagenes industriales o de inspeccion.
- Localizacion de la region anomalica mediante mapas de puntuacion por parche.
- Funcionamiento en regimen one-class: solo requiere imagenes normales para construir el banco de memoria.
- Inferencia sin necesidad de entrenamiento de una red nueva (metodo basado en caracteristicas preentrenadas).
- No dispone de capacidades de generacion de texto, razonamiento linguistico, codigo, matematicas, vision generativa, tool calling, agentes, multilingueismo ni audio.
- No se ha confirmado soporte de modos especiales como thinking mode, vision-language o function calling.

## Casos de uso

- Inspeccion de calidad en linea de produccion: comparar cada pieza fabricada contra el banco de memoria de piezas correctas para detectar rayones, grietas o deformaciones; adecuado por su bajo coste de adaptacion a nuevas lineas (solo se necesitan muestras normales).
- Control de defectos en PCB y semiconductores: localizar soldaduras frias, pistas cortadas o componentes mal colocados mediante el mapa de anomalias por parche.
- Deteccion de anomalias en imagenes medicas (radiografias, retinografias): util como filtro de cribado para marcar imagenes atipicas antes de la revision por especialista.
- Monitorizacion de infraestructuras: analisis de imagenes de sensores o camaras para detectar corrosion, fisuras o acumulacion de suciedad en superficies industriales.
- Verificacion de integridad en logistica: comprobar que el embalaje, etiquetado o producto final coincide con el aspecto esperado y detectar manipulaciones o danos.
- Analisis de imagenes de satelite o dron: identificar cambios atipicos en terreno o cultivos frente a una linea base de imagenes normales.
- Prototipado rapido en laboratorio de vision: servir como referencia funcional para comparar algoritmos de deteccion de anomalias antes de invertir en un modelo propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tarjeta de modelo con metricas, ni referencias a MVTec AD, VisA, BTAD, MMLU, HumanEval o GSM8K. Cualquier cifra de rendimiento relativa a este checkpoint concreto seria especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este checkpoint concreto; el tamano del repo (0,1 GB) sugiere que puede caber en GPUs consumer, pero no se confirma el backbone ni el tamano del banco de memoria.
- GPU recomendadas: no disponibles; en la familia PatchCore es habitual usar GPUs de gama media (por ejemplo RTX 3060/4090) para inferencia y GPUs de datacenter (A100/H100) para construccion de bancos de memoria a gran escala, pero no hay confirmacion para este repositorio.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: no disponibles; al ser un modelo de vision, no encaja en vLLM, llama.cpp, Ollama o TGI, que estan orientados a LLM. El despliegue tipico de PatchCore se realiza con PyTorch/TorchScript o ONNX Runtime, pero no se especifica en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Filiyo/patchcore | PatchCore (banco de memoria) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| PatchCore oficial (amazon-science/patchcore-inspection) | PatchCore (referencia) | backbone WideResNet-50 | no aplica | Apache 2.0 (referencia) | GitHub + pesos |
| PaDiM | Modelo de distribucion de parches | backbone ResNet-18/50 | no aplica | codigo abierto | Repositorios publicos |
| FastFlow | Normalizing flow 2D | backbone ResNet/ViT | no aplica | codigo abierto | Repositorios publicos |

Los datos de licencia, parametros y disponibilidad de las alternativas corresponden a sus repositorios de referencia; para `Filiyo/patchcore` no se dispone de esa informacion en los metadatos publicados.

## Limitaciones y advertencias

- Ausencia de tarjeta de modelo: no se documenta el dataset de entrenamiento, el backbone, la licencia ni los hiperparametros, lo que impide evaluar su idoneidad en produccion.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de integrarlo en un producto.
- Traccion practica nula: 0 descargas y 1 like indican que el checkpoint no ha sido validado por la comunidad.
- Riesgo de sesgo de dominio: cualquier modelo PatchCore entrenado con un dataset concreto (por ejemplo MVTec AD) rinde peor en dominios distintos (iluminacion, camara, material), y este checkpoint no declara su dataset.
- Sensibilidad a cambios de iluminacion, encuadre y resolucion: el banco de memoria de parches es frágil ante variaciones de captura no representadas en las muestras normales.
- No es un modelo de lenguaje: no debe usarse para tareas de texto, codigo, razonamiento o agentes.
- Falta de garantias de calibracion: los scores de anomalia de PatchCore requieren umbrales ajustados por dominio, y no se publica informacion sobre calibracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Filiyo/patchcore
- Paper de referencia PatchCore (Roth et al., 2021): https://arxiv.org/abs/2106.08265
- Implementacion oficial de referencia: https://github.com/amazon-science/patchcore-inspection
- Dataset MVTec AD (referencia habitual de evaluacion): https://www.mvtec.com/company/research/datasets/mvtec-ad
- Dataset VisA: https://github.com/amazon-science/spot-diff
