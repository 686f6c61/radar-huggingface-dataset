# seeyouspace0/clean-chat-analyze-classifier

## Resumen

clean-chat-analyze-classifier (identificador interno `kcelectra-base-ft-0.5`) es un clasificador de texto multietiqueta desarrollado por el usuario seeyouspace0 para detectar expresiones tóxicas en el chat del videojuego League of Legends. El modelo parte de beomi/KcELECTRA-base, un encoder ELECTRA preentrenado en coreano, y se ha ajustado fino para emitir seis puntuaciones independientes (sigmoide) sobre una única frase de entrada: `profanity`, `family_insult`, `sexual_harassment`, `blame`, `instigation` y `threat`. No es un modelo generativo: es un cabezal de clasificación de 109 millones de parámetros con una ventana de 64 tokens.

Su relevancia es acotada pero concreta. Forma parte del módulo `analyze` de la aplicación de demostración Clean Chat, donde se combina con reglas léxicas para asignar un nivel de gravedad (L0-L3) a cada mensaje en tiempo real. El autor lo presenta explícitamente como un modelo de demostración de dos semanas, entrenado exclusivamente con 2.371 frases sintéticas generadas por IA, y desaconseja su uso para sancionar o denunciar usuarios de forma automática.

La ficha se basa únicamente en la model card y los metadatos publicados en Hugging Face. No hay información sobre licencia, benchmarks estándar ni detalles del proceso de entrenamiento más allá de lo indicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (encoder transformer discriminativo), ajustado desde beomi/KcELECTRA-base |
| Parametros totales | 109.085.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens de entrada (limite indicado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificacion de texto multietiqueta (6 etiquetas, activacion sigmoide) |
| Tamano del repositorio | 0,4 GB |
| Modelo base | beomi/KcELECTRA-base (licencia MIT segun el autor) |
| Token de pooling | token 0 (no `[CLS]`, segun la configuracion del tokenizador KcELECTRA) |

## Arquitectura y entrenamiento

El modelo es un ELECTRA base con cabezal de clasificación multietiqueta. ELECTRA sustituye el objetivo de modelado de lenguaje enmascarado por detección de tokens reemplazados, lo que produce representaciones densas y eficientes para tareas discriminativas con presupuestos de cómputo moderados. El ajuste fino aplica seis salidas independientes con activación sigmoide, de modo que una misma frase puede recibir varias etiquetas simultáneamente. El vector de frase se extrae del token 0, siguiendo la configuración del tokenizador de KcELECTRA en lugar de usar el `[CLS]` convencional.

El entrenamiento se realizó exclusivamente con datos sintéticos: 2.371 frases en coreano escritas por Claude bajo especificación (2.014 de entrenamiento y 356 de validación), sin corpus públicos ni chats reales de usuarios. El autor indica que el modelo asume que las evasiones ortográficas (por ejemplo, insultos escritos con consonantes iniciales) ya han sido normalizadas en una etapa previa del pipeline. No se documentan hiperparámetros, número de épocas, técnica de regularización ni si hubo calibración de umbrales. La evaluación se hizo sobre un conjunto sellado de 200 frases redactadas por un autor independiente, también generadas por IA, combinando la salida del modelo con reglas léxicas.

## Capacidades

- Clasificación multietiqueta de toxicidad en frases coreanas con seis categorías: profanidad, insulto familiar, acoso sexual, culpabilización, instigación y amenaza.
- Detección de múltiples tipos de agresión en una misma frase gracias a la activación sigmoide independiente por etiqueta.
- Integración con sistemas de reglas léxicas para derivar niveles de gravedad (L0-L3) en un filtro en tiempo real.
- Procesamiento de entradas cortas (hasta 64 tokens), adecuado para mensajes de chat de una sola línea.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al coreano; no se documenta rendimiento en otros idiomas.
- No es un modelo generativo: no produce texto, solo puntuaciones por etiqueta.

## Casos de uso

- Moderación en tiempo real de chat de videojuegos: el modelo clasifica cada línea del chat de League of Legends en las seis categorías de toxicidad y, combinado con reglas, asigna un nivel L0-L3 que puede disparar avisos o silenciamientos temporales en partidas.
- Filtro previo en herramientas de comunidad: en servidores de Discord o foros de habla coreana centrados en esports, el clasificador puede marcar mensajes para revisión humana antes de su publicación.
- Análisis de toxicidad en postpartida: procesar el histórico de chat de una partida para generar informes agregados de comportamiento por jugador, útil en sistemas de reputación.
- Etiquetado asistido de datasets: usar las seis salidas como preetiquetado de mensajes coreanos para construir corpus de moderación revisados posteriormente por anotadores humanos.
- Investigación sobre toxicidad en videojuegos: servir como línea base reproducible para comparar enfoques de detección multietiqueta en coreano coloquial.
- Componente de un pipeline híbrido: integrarse como segunda etapa tras un normalizador ortográfico que restaure evasiones (consonantes iniciales, sustituciones de caracteres) antes de la clasificación.
- Demo educativa de moderación: el repositorio Clean Chat lo emplea como ejemplo funcional de combinación de reglas y modelo en una aplicación de dos semanas.

## Benchmarks y rendimiento

El autor publica una evaluación sobre un conjunto sellado de 200 frases generadas por IA, comparando el sistema de reglas solo frente a reglas más el modelo:

| Metrica | Reglas solo | Reglas + modelo |
|---|---|---|
| Precision de nivel (L0-L3) | 56,0 % | 89,5 % |
| Recall de frases maliciosas | 40,4 % | 91,2 % |
| Tasa de falsos positivos en frases normales | 8,3 % | 14,6 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (109 M de parámetros, aproximadamente 0,44 GB de pesos); en fp16 alrededor de 0,22 GB más overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en tarjetas de consumo como GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo y también en CPU para cargas moderadas, dado el reducido tamaño y la ventana de 64 tokens.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, pipeline `text-classification`; también es viable exportarlo a ONNX o TorchScript para servir con mayor eficiencia. No se documentan integraciones con vLLM, TGI o llama.cpp (este último no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada; con 64 tokens de entrada y 109 M de parámetros se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| clean-chat-analyze-classifier | 109 M | 64 tokens | Coreano | Clasificacion multietiqueta de toxicidad (6 clases) | no disponible |
| beomi/KcELECTRA-base | ~110 M | 512 tokens (tipico en ELECTRA base) | Coreano | Encoder preentrenado, ajustable a multiples tareas | MIT (segun el autor) |
| beomi/KcBERT-base | ~110 M | 512 tokens (tipico en BERT base) | Coreano | Encoder preentrenado | no disponible en esta ficha |

La comparación con KcELECTRA-base y KcBERT-base es la más directa por tamaño y dominio lingüístico, pero no se dispone de resultados de benchmarks de toxicidad comparables publicados para esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con frases sintéticas generadas por IA; el rendimiento en chat real de personas será previsiblemente inferior, como reconoce el propio autor.
- Tasa de falsos positivos del 14,6 % en frases normales: aproximadamente uno de cada siete mensajes no tóxicos se marca como malicioso.
- Pérdida de aproximadamente un tercio de los casos de ironía o sarcasmo encubierto (el autor indica que se escapan 1 de cada 3).
- Especializado en el registro coloquial del chat de League of Legends; no se recomienda su uso en otros dominios textuales.
- Ventana de contexto muy corta (64 tokens), insuficiente para mensajes largos o conversaciones multi-turno.
- Depende de una etapa previa de normalización ortográfica; sin ella, las evasiones con consonantes iniciales u otras sustituciones pueden pasar desapercibidas.
- Licencia no declarada en la información disponible: es imprescindible verificar los términos antes de cualquier uso comercial o redistribución.
- El autor desaconseja explícitamente su uso para sancionar o denunciar personas de forma automática; está pensado como modelo de demostración.
- No se documentan sesgos específicos más allá de los derivados de los datos sintéticos y del dominio del videojuego.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seeyouspace0/clean-chat-analyze-classifier
- Modelo base KcELECTRA: https://huggingface.co/beomi/KcELECTRA-base
- Repositorio de la demo Clean Chat: https://github.com/makerspaceSiwoo/clean-chat
