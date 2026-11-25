# oxyene/yz50-tts

## Resumen

YZ50 TTS es un modelo de síntesis de voz (text-to-speech) en turco desarrollado por el usuario oxyene (Alperen), construido desde cero sobre una arquitectura GPT-2 y publicado con licencia MIT. El modelo convierte texto turco en tokens del códec Mimi de Kyutai y posteriormente los decodifica a audio a 24 kHz. Con aproximadamente 99 millones de parámetros, se posiciona como un modelo ligero, orientado a experimentación y a despliegue en entornos con recursos limitados.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre habla en turco y un ajuste fino posterior con grabaciones de voz del propio autor, hasta el paso 1500. La model card advierte explícitamente de que la voz generada es sintética y que el modelo está clonando la identidad vocal de su creador, un detalle relevante tanto desde el punto de vista técnico como ético.

Su relevancia actual es limitada pero concreta: es un ejemplo de pipeline TTS completo y reproducible (texto → tokens Mimi → audio) con código abierto, útil para quienes quieran estudiar o replicar un sistema TTS de bajo coste en un idioma con menos recursos que el inglés. No obstante, el repositorio no incluye métricas de calidad, benchmarks ni documentación detallada sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (12 capas, dimensión 768), decoder autoregresivo sobre tokens del códec Mimi |
| Parametros totales | ~99 M (según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,2 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura GPT-2 escrita desde cero, con 12 capas y dimensión oculta de 768, lo que da lugar a un total de aproximadamente 99 millones de parámetros. La salida del modelo no es audio directo, sino tokens del códec neuronal Mimi de Kyutai, que después se decodifican a una señal de audio de 24 kHz. Este enfoque de "LLM sobre tokens de códec" es habitual en TTS modernos y permite reutilizar infraestructura de transformers estándar.

El entrenamiento consta de dos etapas según la model card: primero un preentrenamiento sobre habla en turco y después un ajuste fino con grabaciones de voz del propio autor, alcanzando el paso 1500. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en turco, con salida de audio a 24 kHz.
- Generación de habla mediante decodificación autoregresiva de tokens Mimi.
- Clonación de voz específica del hablante usado en el ajuste fino (la voz del autor).
- Pipeline completo texto → tokens → audio reproducible con el código publicado.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el modelo está entrenado únicamente para turco.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Prototipado de asistentes de voz en turco: al ser un modelo de ~99 M de parámetros, puede ejecutarse en CPU o GPU modesta para validar flujos de conversación antes de invertir en modelos mayores.
- Investigación sobre TTS con códecs neuronales: sirve como referencia reproducible del pipeline texto → tokens Mimi → audio para estudiar el comportamiento de esta familia de arquitecturas.
- Generación de audiolibros o contenido narrado en turco para uso personal o interno, siempre que se respete la licencia MIT y se advierta de que la voz es sintética.
- Educación y docencia: el repositorio incluye un notebook de demostración en Colab que facilita explicar paso a paso cómo se construye un TTS desde cero.
- Pruebas de integración en aplicaciones de accesibilidad para hablantes de turco, como lectura de texto en pantalla, con la cautela de que no hay métricas publicadas de naturalidad.
- Base para ajuste fino adicional: al ser un modelo pequeño y con licencia permisiva, puede servir como punto de partida para adaptarlo a otros hablantes o dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~99 M de parámetros en precisión FP32 el peso ronda los 0,4 GB, por lo que en la práctica es desplegable en GPU de gama baja o incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente. También cabría en GPUs integradas para inferencia no interactiva.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor proporciona un notebook de Colab y código en GitHub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YZ50 TTS (oxyene) | ~99 M | no disponible | Turco | MIT | Hugging Face + GitHub |
| Alternativas TTS turco de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos TTS en turco; los datos de benchmarks y de modelos comparables no están publicados en la información proporcionada.

## Limitaciones y advertencias

- La voz generada es sintética y está basada en las grabaciones del propio autor; su uso para suplantación de identidad o fines engañosos es especialmente sensible.
- No se han publicado métricas objetivas de calidad (MOS, WER, similitud de hablante), por lo que no es posible evaluar su naturalidad frente a alternativas.
- El modelo solo soporta turco; no hay evidencia de generalización a otros idiomas.
- Riesgo de alucinación en la prosodia y en la pronunciación de palabras poco frecuentes, típico de modelos TTS pequeños entrenados con datos limitados.
- No se documenta el dataset de entrenamiento, lo que dificulta evaluar sesgos de género, acento o dialecto.
- Aunque la licencia MIT permite uso comercial, la clonación de una voz concreta puede tener implicaciones legales y éticas adicionales según la jurisdicción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.
- No se especifica el formato de pesos ni el proceso de carga, lo que puede complicar su integración en pipelines de producción.

## Enlaces

- Hugging Face: https://huggingface.co/oxyene/yz50-tts
- Código en GitHub: https://github.com/0xyene/yz50/tree/main/demo-day
- Página Demo Day: https://0xyene.github.io/yz50/demo-day/page/
- Notebook de demostración: `yz50_tts_demo.ipynb` (referenciado en la model card)
- Códec Mimi de Kyutai: https://huggingface.co/kyutai/mimi
