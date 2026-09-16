# bentang18/MAPA

## Resumen

MAPA (Masked Autoencoder for Population-level Anatomy) es un modelo de representación de señales de electroencefalografía intracraneal (iEEG/SEEG) desarrollado por Ben Tang, Zachary Spalding y Gregory B. Cogan, del grupo de investigación de Duke University. El modelo resuelve el problema de la escasez de datos en interfaces neuronales: en lugar de entrenar un decodificador por paciente desde cero, MAPA preentrena un codificador sobre señales iEEG con un objetivo de autoencoder enmascarado y aprende representaciones que se transfieren entre sujetos, de modo que una tarea concreta puede resolverse con muy pocas muestras etiquetadas.

El núcleo es un ViT-Small de anchura 384 y 12 bloques que consume tres bandas de espectrogramas STFT normalizados (Slow, Mid y Fast) y produce características por contacto. Dos innovaciones permiten la transferencia entre sujetos: un embedding de región anatómica basado en el atlas DKT (74 regiones más una entrada reservada) y una codificación posicional relativa construida a partir de la diferencia entre números de contacto clínicos a lo largo de un array. El decodificador se descarta tras el preentrenamiento.

El modelo se publica con licencia apache-2.0, en formato PyTorch, con cuatro checkpoints que reproducen las ablaciones espaciales del artículo (con y sin region embedding, con y sin codificación posicional relativa). No es un modelo generativo de texto ni un modelo de lenguaje: es un extractor de características para neurociencia, con un tamaño de repositorio de 0,3 GB y 21,3 millones de parámetros en su variante principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder enmascarado (MAE) con codificador ViT-Small (anchura 384, 12 bloques); decodificador descartado tras el preentrenamiento |
| Parametros totales | 21.335.424 (variante con region embedding y codificación posicional relativa); 21.306.624 (variantes sin region embedding) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de tokens de lenguaje; procesa ventanas de 1 segundo, con 52 tokens por segundo y contacto |
| Tipos de cuantizacion | No disponible (checkpoint en fp32 en formato `.pt`; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplicable (modelo de señales neuronales, no de lenguaje) |
| Licencia | apache-2.0 (el repositorio incluye además un archivo `LICENSE-WEIGHTS` específico para los pesos) |
| Formato de pesos | PyTorch (`.pt`, `mapa_vits384.pt` y tres checkpoints de ablación) |

## Arquitectura y entrenamiento

MAPA es un autoencoder enmascarado (masked autoencoder) adaptado a iEEG. El codificador es un ViT-Small de anchura 384 y 12 bloques que opera sobre una representación de parches: cada parche contiene los bins de frecuencia de una banda, en un contacto y en un paso temporal de la tasa de esa banda. La entrada son tres tensores STFT de magnitud normalizada (Slow, Mid, Fast), cada uno con forma `(batch, contacts, bins, time)`, sobre un reloj de trama compartido de 32 Hz; el frontend diezma cada banda a su tasa correspondiente. Cada contacto aporta 52 tokens por segundo y las características se mantienen por contacto, en el orden definido por `session.contact_order`.

La innovación principal para la transferencia entre sujetos es doble. Primero, un embedding de región anatómica con vocabulario del atlas DKT de 75 entradas (74 regiones más una reservada, ID 74, para contactos fuera del vocabulario), que distingue hemisferios. Segundo, una codificación posicional relativa basada en la diferencia entre números de contacto clínicos a lo largo de un array, junto con RoPE para codificar el tiempo. Ninguna de las dos codificaciones espaciales usa coordenadas en un cerebro plantilla. El vocabulario de regiones aporta 75 × 384 = 28.800 parámetros. Los checkpoints se tomaron en el paso 55.000 y no incluyen decodificador ni optimizador. El artículo no detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO (no aplicable a este tipo de modelo); sí se documentan las `Guard 1/2/3` del preprocesamiento.

## Capacidades

- Extracción de características neuronales a partir de señales iEEG brutas o preprocesadas, con salidas por contacto.
- Aprendizaje de representaciones transferibles entre sujetos gracias al embedding de región anatómica DKT y a la codificación posicional relativa.
- Procesamiento multibanda de espectrogramas STFT en tres resoluciones temporales (Slow, Mid, Fast).
- Salidas configurables mediante "taps": tap 0 devuelve características de entrada del frontend `(batch, contacts, 1, 348)` para ventanas de un segundo; taps 3, 6, 9 y 12 devuelven características del codificador `(batch, contacts, 52, 384)`.
- Ablaciones espaciales publicadas para análisis científico (con/sin region embedding, con/sin codificación posicional relativa).
- Preprocesamiento de grabaciones completas mediante `mapa.preprocessing.prepare_recording` (referenciación, filtrado, STFTs y normalización de sesión congelada).
- No soporta tool calling, function calling, agentes ni generación de texto: el checkpoint devuelve características neuronales y no incluye decodificador específico de tarea.
- No soporta visión ni audio en el sentido de modelos multimodales de propósito general.

## Casos de uso

- Interfaces cerebro-computador (BCI) con pocas muestras: el codificador preentrenado puede congelarse y servir como extractor sobre el que entrenar un clasificador ligero por paciente, reduciendo el número de ensayos etiquetados necesarios frente a entrenar desde cero.
- Decodificación motora en investigación: usar las características por contacto (52 tokens/s por contacto, 384 dimensiones) como entrada a decodificadores de movimiento o intención de movimiento en grabaciones iEEG de sujetos humanos.
- Detección de eventos epilépticos: las representaciones multibanda (Slow 2-14 Hz, Mid 16-56 Hz, Fast 64-160 Hz) permiten alimentar clasificadores de crisis o de actividad interictal con características espacialmente informadas.
- Decodificación del habla y del lenguaje: aprovechar la resolución temporal de las bandas Mid y Fast para tareas de decodificación fonética o semántica, con la ventaja de un embedding anatómico compartido entre sujetos.
- Análisis de conectividad y representaciones entre sujetos: la codificación posicional relativa y el vocabulario DKT permiten comparar representaciones entre diferentes implantaciones y pacientes sin depender de coordenadas en un cerebro plantilla.
- Extracción de características para pipelines de neurociencia: integrar el encoder en flujos de análisis existentes (Python 3.10+, PyTorch 2.6+) mediante `hf_hub_download` y la API `MapaEncoder`.
- Evaluación comparativa en benchmarks de neurociencia: el modelo se acompaña del benchmark Neuroprobe, lo que permite comparar representaciones de forma estandarizada aplicando las exclusiones congeladas por sesión (`Guard 1`).
- Investigación en aprendizaje autosupervisado aplicado a bioseñales: las cuatro variantes de checkpoint permiten estudiar de forma controlada la contribución de priors anatómicos al rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el benchmark Neuroprobe (`https://neuroprobe.dev/`) y el artículo `arXiv:2609.13507`, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) en la información proporcionada. Tampoco se ofrecen datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint principal tiene 21,3 millones de parámetros. En fp32 ocupa aproximadamente 85 MB, por lo que el modelo cabe con holgura en cualquier GPU con más de 1 GB de VRAM, y probablemente también en CPU para inferencia por lotes pequeños.
- GPU recomendadas: no requiere hardware de gama alta. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella será el volumen de datos de iEEG, no el modelo.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo actual e incluso en iGPU recientes, dado el reducido tamaño del modelo.
- Opciones de despliegue: PyTorch nativo mediante la librería `mapa` y `huggingface_hub`. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (extracción de características en iEEG/neurociencia) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el modelo se ha preentrenado sobre un conjunto de datos que no se detalla en la información proporcionada, por lo que se desconoce su cobertura demográfica y clínica.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, ya que el modelo no genera lenguaje; sí existe riesgo de que las características aprendidas no generalicen a nuevos sujetos, montajes de electrodos o condiciones de registro.
- Limitaciones de contexto o idioma: no soporta idiomas ni texto; su dominio se limita a señales iEEG. El vocabulario anatómico DKT cubre 74 regiones más una reservada para contactos fuera de esa taxonomía, lo que puede limitar la cobertura en montajes atípicos.
- Restricciones de licencia: los pesos se rigen por apache-2.0, pero el repositorio incluye un archivo `LICENSE-WEIGHTS` adicional que conviene revisar antes de un uso comercial. El código está vinculado a un commit concreto (`bf2b49e7`) y a la release `v0.1.0`.
- Caveats para producción: el checkpoint no incluye decodificador de tarea ni cabecera de clasificación; es necesario entrenar uno específico. El preprocesamiento exige grabaciones limpias y selecciones explícitas de contactos, e incluye exclusiones congeladas (`Guard 1`) que afectan a la evaluación y deben aplicarse antes de la referenciación de shaft. Los detectores `Guard 1/2` no se distribuyen y `Guard 2` no rechaza ventanas de evaluación. La normalización de sesión está congelada y las entradas se recortan a ±15/±15/±20 antes de la proyección (`Guard 3`). El uso de tap 0 devuelve características del frontend (348 dimensiones), no representaciones de 384 dimensiones del codificador.
- Los enlaces de búsqueda web proporcionados no guardan relación con el modelo (corresponden a un sitio de numismática), por lo que no se incluyen como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bentang18/MAPA
- Artículo: https://arxiv.org/abs/2609.13507 (Pretraining for Sample-Efficient Neural Interfaces)
- Código: https://github.com/bentang18/MAPA
- Página del proyecto: https://bentang18.github.io/mapa-page/
- Benchmark Neuroprobe: https://neuroprobe.dev/
- Release v0.1.0 (checkpoints byte-idénticos): https://github.com/bentang18/MAPA/releases/tag/v0.1.0
- Guía de preprocesamiento: https://github.com/bentang18/MAPA/blob/bf2b49e73e28275c37f2aded6bcada606a5d0b90/docs/PREPROCESSING.md
- Configuración de preprocesamiento: https://github.com/bentang18/MAPA/blob/bf2b49e73e28275c37f2aded6bcada606a5d0b90/mapa/preprocessing/config.json
- Vocabulario anatómico DKT (`anatomy.py`): https://github.com/bentang18/MAPA/blob/bf2b49e73e28275c37f2aded6bcada606a5d0b90/mapa/data/anatomy.py
