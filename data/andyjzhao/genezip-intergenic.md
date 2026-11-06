# andyjzhao/GeneZip-Intergenic

## Resumen

GeneZip-Intergenic es un modelo de lenguaje de ADN (DNA language model) preentrenado, publicado por el autor andyjzhao bajo el nombre definitivo de su artículo (*camera ready*). No es un checkpoint afinado para una tarea concreta, sino un conjunto de pesos de preentrenamiento destinados a servir como base para investigación en modelado de secuencias genómicas y para los *recipes* de evaluación DNALongBench que acompañan al proyecto GeneZip.

El modelo se ha preentrenado con una ventana de contexto de 12.800 pares de bases (bp) y un objetivo de compresión base de 32 bp por token (BPT32), lo que implica una tokenización agresiva del ADN orientada a capturar dependencias de largo alcance en regiones intergénicas. Los pesos provienen de un checkpoint intermedio concreto (`checkpoint-30600`) del repositorio de origen y se distribuyen sin modificar, con la configuración de Hydra reducida a arquitectura, enrutamiento y metadatos científicos.

La relevancia actual del modelo radica en su enfoque de compresión de secuencias largas y en su integración con un *framework* de código propio (no es un paquete `AutoModel` de Transformers), lo que lo sitúa en la línea de investigación de modelos de ADN de contexto extendido. El repositorio ocupa 0,3 GB y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (configuración registrada en `hydra_cfg.yaml`; no se detalla en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | 12.800 bp (pares de bases) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (secuencias de ADN); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos PyTorch (repo de 0,3 GB); no es un paquete `AutoModel` de Transformers |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que la configuración exacta de arquitectura y enrutamiento (*routing*) queda registrada en el fichero `hydra_cfg.yaml` del repositorio de pesos. El término "routing" sugiere un mecanismo de enrutamiento de tokens o expertos, pero no se confirma en la información disponible si se trata de un transformer denso, un MoE o una arquitectura híbrida. El modelo es un checkpoint personalizado de GeneZip, no un paquete estándar de Transformers.

El preentrenamiento se realizó con un contexto de 12.800 bp y un objetivo de compresión base de 32 bp/token. La model card aclara explícitamente que 32 bp/token es el objetivo de compresión, no la ratio de compresión medida. Los pesos proceden del checkpoint `checkpoint-30600` del repositorio `jzshared/GeneZip-AntiBioPrior-BPT32-12.8K`, con hash SHA-256 `a35a52717e68e26abae507b5a9dc547f60ae6de19e0aeb56345bd0c3ce525d89`, y los bytes de los pesos no se han modificado respecto a esa fuente fijada. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelado de secuencias de ADN en regiones intergénicas con contexto de 12.800 bp.
- Preentrenamiento como base para *fine-tuning* en tareas downstream de genómica (el repositorio no incluye pesos afinados).
- Evaluación mediante los *recipes* de DNALongBench del proyecto GeneZip.
- Integración con el código *camera ready* de GeneZip, que acepta `ckpt=andyjzhao/GeneZip-Intergenic` para entrenamiento downstream.
- Evaluación de preentrenamiento mediante el evaluador que usa `pretrained_ckpt` con la configuración de modelo y contexto correspondiente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, por no ser aplicables a un modelo de secuencias genómicas.

## Casos de uso

- Investigación en modelado de secuencias genómicas: el modelo sirve como base preentrenada para experimentos de representación de ADN en regiones intergénicas, aprovechando su contexto de 12.800 bp para capturar dependencias de largo alcance.
- Fine-tuning downstream en genómica: mediante el código de GeneZip, se puede pasar el checkpoint como `ckpt` para entrenar tareas específicas sobre las representaciones preentrenadas.
- Reproducción de resultados de DNALongBench: los *recipes* del proyecto permiten evaluar el modelo en las tareas de dicho benchmark con la configuración de contexto adecuada.
- Validación de carga y ejecución (*smoke checks*): útil para verificar que el *pipeline* de GeneZip carga y ejecuta correctamente los pesos antes de lanzar experimentos completos.
- Estudio de tokenización y compresión de ADN: el objetivo de 32 bp/token permite analizar cómo afecta la compresión de secuencias a la calidad de las representaciones en regiones intergénicas.
- Base para comparativas de modelos de ADN de contexto largo: al ser un checkpoint intermedio fijado con hash verificable, facilita la reproducibilidad en estudios comparativos.
- Integración en *pipelines* de investigación reproducibles: el fichero `provenance.json` registra la revisión inmutable y el hash de los pesos de origen, lo que ayuda a auditar experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las comprobaciones cortas de ejecución (*smoke checks*) solo establecen la carga y ejecución del modelo, y no constituyen nuevas mediciones del rendimiento completo en benchmarks; para los resultados adoptados debe consultarse el mapeo de resultados del código de GeneZip.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el uso previsto es a través del código propio de GeneZip (repositorio `AndyJZhao/GeneZip`).
- Latencia y throughput: no disponibles.
- Tamaño del repositorio de pesos: 0,3 GB, lo que da una cota inferior del espacio en disco necesario para el checkpoint.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de lenguaje de ADN con contexto de 12.800 bp y objetivo de compresión de 32 bp/token), ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un checkpoint afinado: el repositorio contiene únicamente pesos de preentrenamiento, sin pesos downstream ni estado del optimizador.
- No es un paquete `AutoModel` de Transformers: requiere el código personalizado de GeneZip para cargarse y ejecutarse.
- La model card advierte de que las comprobaciones cortas de ejecución no son mediciones de rendimiento completo en benchmarks; no deben interpretarse como resultados de evaluación.
- El objetivo de 32 bp/token es un objetivo de compresión, no la ratio de compresión medida; no debe citarse como ratio real.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, por no ser aplicables a un modelo de secuencias genómicas.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de atribución y de los términos del código asociado.
- El modelo está orientado a investigación en modelado genómico; no se documenta su validación para uso clínico ni diagnóstico.
- La información sobre arquitectura, parámetros y datos de entrenamiento es escasa; cualquier uso en producción debería acompañarse de una validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andyjzhao/GeneZip-Intergenic
- Repositorio de origen de los pesos: https://huggingface.co/jzshared/GeneZip-AntiBioPrior-BPT32-12.8K/tree/3b9c82577ee4159ef6ab3421f4bca45ab2fee5f8/checkpoint-30600
- Código de GeneZip (camera ready): https://github.com/AndyJZhao/GeneZip
