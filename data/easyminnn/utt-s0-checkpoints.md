# easyminnn/utt-s0-checkpoints

## Resumen

UTT (Unified Tactile Tokenizer) es un tokenizador táctil unificado, es decir, un codificador/decodificador de senales de sensores tactiles disenado para ser agnostico al sensor. Lo publica el usuario easyminnn en HuggingFace como un conjunto de checkpoints intermedios de la fase de preentrenamiento S0, liberados mientras el entrenamiento sigue en curso para permitir su evaluacion por parte de la comunidad. No es un modelo de lenguaje ni un modelo multimodal generativo al uso: su proposito es convertir lecturas de sensores tactiles en representaciones tokenizadas y reconstruirlas, de forma que puedan integrarse en pipelines de robotica.

El repositorio contiene unicamente pesos en fp32 (sin estado del optimizador) organizados por etapas. La etapa `s0a` mantiene congelado el stem de imagen basado en Sparsh-DINO, mientras que `s0b` lo afina con un learning rate de 0.1x partiendo de `s0a`. El codigo asociado vive en la rama `tactile-tower-tva` del repositorio `jiminlx/cosmos-framework`, bajo la ruta `cosmos_framework/model/generator/tokenizers/utt/`.

Es relevante ahora porque aborda uno de los cuellos de botella clasicos en robotica tactil: la falta de representaciones unificadas entre sensores heterogeneos. Un tokenizador agnostico al sensor permite reutilizar el mismo encoder/decoder con distintos hardware tactiles, lo que simplifica el entrenamiento de politicas y modelos de manipulacion. El principal caveat es que son checkpoints de trabajo en progreso y que parte de los datos de origen tienen licencias no comerciales o solo de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder/decoder de tokenizacion tactil; stem de imagen basado en Sparsh-DINO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en fp32 |
| Idiomas soportados | no disponible (modelo tactil, no linguistico) |
| Licencia | other (con datasets de origen bajo licencias no comerciales / solo investigacion) |
| Formato de pesos | `.pt` (PyTorch, fp32, solo pesos del modelo mas configuracion y metricas) |

## Arquitectura y entrenamiento

La informacion disponible describe UTT como un tokenizador tactil unificado y agnostico al sensor, implementado como un par encoder/decoder. La parte visual del modelo emplea un stem de imagen derivado de Sparsh-DINO, que en la etapa `s0a` permanece congelado y en la etapa `s0b` se afina con una tasa de aprendizaje reducida (0.1x) partiendo de los pesos de `s0a`. No se especifican en la informacion proporcionada el numero de parametros, el tipo exacto de capas del encoder tactil, ni la dimension del espacio latente de tokenizacion.

Respecto a los datos, el entrenamiento usa el split de preentrenamiento de `easyminnn/utt-tactile-prepared` v0. La model card advierte explicitamente de que varios de los datasets fuente tienen licencias no comerciales o de solo investigacion, documentadas en los ficheros `SOURCE.md` correspondientes. No se indica el numero de tokens o muestras, la composicion detallada del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables en principio a un tokenizador). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Tokenizacion de senales tactiles: codifica lecturas de sensores tactiles en representaciones discretas o latentes y las decodifica de vuelta.
- Independencia del sensor: el diseno es agnostico al tipo de sensor tactil, lo que permite usar el mismo tokenizador con hardware heterogeneo.
- Integracion con un stem visual tipo Sparsh-DINO, lo que sugiere capacidad de combinar informacion visual y tactil en la representacion.
- Uso previsto en pipelines de robotica (pipeline declarado: `robotics`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no es un modelo linguistico).
- Modo thinking, vision o audio: no disponible mas alla del componente visual del stem.

## Casos de uso

- Preentrenamiento de politicas de manipulacion robotica: el tokenizador convierte senales tactiles en representaciones compactas que pueden alimentar una policy de control, reduciendo la dimensionalidad de la entrada sensorial.
- Transferencia entre sensores tactiles: al ser agnostico al sensor, permite entrenar un modelo con un sensor y desplegarlo o adaptarlo a otro sin redisenar la capa de representacion.
- Aprendizaje por imitacion con datos tactiles: las representaciones tokenizadas se pueden alinear con demostraciones humanas o teleoperadas para entrenar controladores.
- Compresion y reconstruccion de senales tactiles: el decoder permite reconstruir la senal original, lo que es util para almacenar grandes registros tactiles de forma comprimida.
- Fusion vision-tactil: gracias al stem Sparsh-DINO, el modelo puede combinarse con encoders visuales para tareas que requieren ambas modalidades, como agarre preciso o deslizamiento controlado.
- Investigacion en representaciones multimodales: sirve como modulo de tokenizacion dentro de frameworks mayores (Cosmos, en la rama `tactile-tower-tva`) para estudiar como representar el tacto de forma unificada.
- Evaluacion de checkpoints intermedios: los ficheros `metrics.json` e `index.json` permiten seleccionar el mejor paso segun `val/loss` para experimentos comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica documentada es la perdida de validacion (`val/loss`) almacenada por etapa en `<stage>/index.json` junto con `latest_step` y `best_step`, y en los `metrics.json` de cada checkpoint. No se proporcionan valores numericos concretos de dicha perdida en la informacion recibida.

## Requisitos de hardware

- El repositorio ocupa 25.9 GB, lo que corresponde a los pesos en fp32 de los checkpoints publicados (no al modelo individual en ejecucion).
- VRAM estimada para inferencia: no disponible, al no conocerse el numero de parametros ni la secuencia de entrada.
- GPU recomendadas: no disponible. La carga habitual de un checkpoint en fp32 con `torch.load` en CPU requiere RAM proporcional al tamano del fichero `model.pt`.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: la model card muestra carga directa con PyTorch (`torch.load` con `weights_only=True`) y la clase `UTT(UTTConfig(**ck["config"]))`; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni referencias a tokenizadores tactiles alternativos.

## Limitaciones y advertencias

- Son checkpoints de trabajo en progreso ("work-in-progress"), publicados durante el entrenamiento, por lo que no representan versiones finales ni estables.
- Los pesos son solo del modelo (fp32, sin estado del optimizador); no permiten reanudar el entrenamiento tal cual.
- Varios datasets de origen tienen licencias no comerciales o de solo investigacion: el uso comercial de estos pesos puede estar restringido y debe revisarse en los `SOURCE.md` de `easyminnn/utt-tactile-prepared`.
- La licencia declarada es `other`, lo que obliga a consultar los terminos especificos antes de cualquier uso en produccion.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en dominios fuera del tactil (no es un modelo generativo de texto).
- No se especifican parametros, contexto ni idiomas, lo que dificulta estimar costes de despliegue o limites operativos.
- La dependencia del codigo de `jiminlx/cosmos-framework` (rama `tactile-tower-tva`) implica que la reproducibilidad depende de esa base de codigo concreta.

## Enlaces

- HuggingFace (checkpoints): https://huggingface.co/easyminnn/utt-s0-checkpoints
- Dataset de entrenamiento: https://huggingface.co/datasets/easyminnn/utt-tactile-prepared
- Codigo (repositorio Cosmos, rama `tactile-tower-tva`): https://github.com/jiminlx/cosmos-framework
- Ruta del codigo del tokenizador: `cosmos_framework/model/generator/tokenizers/utt/`
- Paper, blog o demo: no disponible
