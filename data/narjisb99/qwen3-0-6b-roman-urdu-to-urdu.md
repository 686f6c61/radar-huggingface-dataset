# narjisb99/qwen3-0.6b-roman-urdu-to-urdu

## Resumen

Qwen3-0.6B Roman Urdu → Urdu script es un modelo de 0,6 mil millones de parámetros derivado de Qwen/Qwen3-0.6B mediante un ajuste fino con LoRA, especializado en una única tarea: convertir texto en roman urdu (la forma en que los hablantes de urdu escriben su idioma con letras latinas en aplicaciones de mensajería) a escritura urdu nativa (alfabeto persoárabe). Lo desarrolla narjisb99 en el contexto del Qwen Local Hackathon 2026 (Qwen Pakistan) y se publica bajo licencia Apache 2.0.

El problema que aborda es real y concreto: la mayoría de los paquistaníes escribe urdu en caracteres latinos porque los teclados de móvil lo facilitan, pero los formularios, documentos y señalización requieren escritura urdu real, que es lenta de teclear. Los conversores basados en reglas fallan porque el roman urdu no tiene ortografía fija (*hai*, *he* y *hy* son la misma palabra), por lo que un modelo pequeño entrenado con ejemplos aprende esos patrones de forma estadística.

El modelo base Qwen3-0.6B no puede realizar esta tarea en absoluto: devuelve el texto romanizado sin cambios. El ajuste fino lo convierte en un transliterador funcional que corre en local, con un peso de 643 MB en formato int4 para Ollama y unos 0,3 segundos por frase en un MacBook Air M2. Su relevancia actual reside en la privacidad: al ejecutarse en el dispositivo, los mensajes personales no salen del equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configurado en Ollama; las entradas son frases individuales) |
| Tipos de cuantizacion | int4 (Ollama), 4-bit MLX (Apple Silicon), safetensors en precisión completa |
| Idiomas soportados | Urdu (ur); entrada en roman urdu y salida en escritura urdu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado), MLX 4-bit, adaptador LoRA en formato MLX, Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros, sobre el que se aplica un ajuste fino con LoRA. El repositorio contiene el modelo fusionado en precisión completa (LoRA integrado en los pesos base), el adaptador LoRA por separado en formato MLX y una versión cuantizada a 4 bits para MLX y otra int4 para Ollama.

El entrenamiento se realizó en dos iteraciones. La versión v1 se entrenó únicamente con texto de Wikipedia procedente del dataset google-research-datasets/dakshina. La versión v2, la publicada, añade un conjunto de frases cotidianas escritas por el equipo, lo que mejora notablemente el rendimiento en lenguaje coloquial: la tasa de error de caracteres (CER) en el conjunto de frases cotidianas baja del 17,8 % al 10,6 %, y el exact match sube del 3,3 % al 18,3 %. No se menciona en la información disponible el uso de RLHF ni DPO; el ajuste se orienta a una tarea de transliteración supervisada.

Una innovación práctica destacable es la gestión del modo de pensamiento de Qwen3: el modelo emite un bloque `` vacío al inicio de cada respuesta aunque el razonamiento esté desactivado. El script de demostración lo elimina, y a través de la API debe enviarse `"think": false` y limpiar las etiquetas manualmente. La plantilla de chat incluida en `mlx-4bit/` ya desactiva el pensamiento.

## Capacidades

- Transliteración de roman urdu a escritura urdu nativa, incluyendo variantes ortográficas informales (*hai*, *he*, *hy*).
- Generación de texto conversacional de una sola frase o frases cortas (hasta unas 30 palabras).
- Ejecución completamente local y offline, sin dependencia de servicios en la nube.
- Despliegue en Apple Silicon mediante MLX y en cualquier plataforma mediante Ollama.
- Conversión por lotes a través de scripts de preparación y evaluación incluidos en el repositorio.
- No soporta tool calling ni function calling de forma específica para esta tarea.
- No soporta agentes ni razonamiento multi-paso; el modo de pensamiento de Qwen3 está desactivado.
- Capacidad multilingüe limitada al par roman urdu / urdu; no se documentan otras lenguas.
- No dispone de visión ni audio.

## Casos de uso

- Digitalización de formularios y documentos: el modelo convierte respuestas escritas en roman urdu por usuarios en formularios web a escritura urdu para su impresión o archivo oficial, aprovechando que procesa frases cortas con una latencia de unos 0,3 segundos por frase en un M2.
- Mensajería privada con conversión local: al ejecutarse íntegramente en el dispositivo (643 MB en Ollama), permite que un usuario escriba en roman urdu y obtenga texto urdu listo para copiar sin que sus mensajes salgan del equipo, lo que es adecuado para comunicaciones sensibles.
- Señalización y cartelería: conversión de borradores redactados en roman urdu a escritura urdu para rótulos, menús o avisos, donde la exactitud carácter a carácter es importante y el modelo alcanza aproximadamente un 89 % de caracteres correctos.
- Normalización de contenido generado por usuarios: en plataformas que reciben comentarios en roman urdu, el modelo puede transliterarlos a urdu antes de publicarlos o indexarlos, mejorando la coherencia del contenido mostrado.
- Asistencia a la escritura en urdu: integración en editores de texto o teclados virtuales como paso de conversión para usuarios que dominan el roman urdu pero teclean lentamente en escritura urdu.
- Procesamiento por lotes de corpus: los scripts incluidos en `scripts/` permiten aplicar el modelo a conjuntos de frases para preparar datos de entrenamiento o evaluación en proyectos de procesamiento del lenguaje natural en urdu.
- Evaluación y prototipado de transliteración: el repositorio incluye todos los resultados y registros de entrenamiento, lo que lo hace útil como referencia reproducible para investigadores que trabajen en transliteración de lenguas de bajos recursos.

## Benchmarks y rendimiento

Resultados en frases cotidianas (60 frases de prueba escritas por el equipo), decodificación voraz (temperatura 0):

| Modelo | Exact match | CER |
|---|---:|---:|
| Qwen3-0.6B base (4-bit MLX) | 0 % | 107,7 % |
| v1: solo Wikipedia | 3,3 % | 17,8 % |
| v2: Wikipedia + cotidiano (este modelo), 4-bit MLX + adaptador | 18,3 % | 10,6 % |
| v2 fusionado, luego 4-bit MLX (`mlx-4bit/`) | 18,3 % | 11,0 % |
| v2 fusionado, luego int4 en Ollama | 21,7 % | 11,0 % |

Resultados en frases de Wikipedia (300 frases de prueba de Dakshina):

| Modelo | Exact match | CER | Segundos por frase (M2) |
|---|---:|---:|---:|
| Qwen3-0.6B base | 0 % | 100,2 % | 0,39 |
| v1 | 10,7 % | 10,2 % | 1,13 |
| v2 (este modelo) | 9,7 % | 11,3 % | 0,54 |

El exact match es bajo porque un solo carácter incorrecto invalida la frase completa; aproximadamente el 89 % de los caracteres son correctos. Como referencia, el artículo de Dakshina señala que los anotadores humanos discreparon entre sí en torno al 3,5–8,5 % de los caracteres. El conjunto de Wikipedia no se volvió a evaluar con la versión int4 de Ollama; en el conjunto cotidiano, la cuantización int4 costó aproximadamente medio punto de CER.

## Requisitos de hardware

- VRAM estimada: unos 660 MB de memoria en carga con la versión int4 de Ollama (según `ollama ps`); 331 MB para la versión 4-bit MLX; el repositorio completo ocupa 1,6 GB.
- GPU recomendadas: no se especifican GPU dedicadas; el modelo está probado en Apple Silicon (MacBook Air M2) y funciona en CPU. Cualquier GPU consumer con más de 1 GB de VRAM libre es suficiente para la versión cuantizada.
- Cabe en GPU consumer: sí, en cualquier tarjeta consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: Ollama (probado con la versión 0.40.16 en macOS), MLX-LM en Apple Silicon, Transformers con el modelo fusionado en safetensors, y text-generation-inference según las etiquetas del repositorio.
- Latencia y throughput: aproximadamente 0,3 segundos por frase en un MacBook Air M2 con la versión int4 de Ollama; 0,54 segundos por frase en el conjunto de Wikipedia con la versión v2 en M2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B Roman Urdu → Urdu (este) | 596 M | 4096 | Transliteración roman urdu → urdu | Apache 2.0 | Hugging Face, Ollama, MLX |
| Qwen3-0.6B base | 596 M | 32768 (típico de Qwen3) | Generación de texto general | Apache 2.0 | Hugging Face |
| Conversores basados en reglas | No aplica | No aplica | Transliteración | Variable | Diversas herramientas |

Frente al modelo base Qwen3-0.6B, la diferencia es cualitativa: el base devuelve el texto romanizado sin cambios (CER del 107,7 % en frases cotidianas), mientras que este modelo alcanza un CER del 10,6 %. Frente a los conversores basados en reglas, la ventaja es el manejo de la ortografía variable del roman urdu, que las reglas no capturan. No se dispone en la información proporcionada de comparaciones con otros modelos especializados en transliteración urdu.

## Limitaciones y advertencias

- Los préstamos del inglés son la principal debilidad: palabras como *discount*, *walk* o *WhatsApp* salen distorsionadas porque Dakshina es texto de Wikipedia y apenas contiene inglés coloquial. Ejemplo: *thora sa discount kar dein bhai* produce اٹھارا سا ڈسکٹ کر دیں بھائی۔ en lugar de تھوڑا سا ڈسکاؤنٹ کر دیں بھائی۔
- El conjunto de prueba cotidiano tiene solo 60 frases, por lo que diferencias de pocos puntos (por ejemplo, 21,7 % frente a 18,3 % de exact match) están dentro del ruido estadístico.
- Está ajustado para frases individuales de hasta unas 30 palabras; los párrafos largos no se han evaluado.
- La cuantización introduce degradación: *kaun* salió como کاون en la versión int4 de Ollama, aunque era correcto antes de cuantizar.
- Riesgo de alucinación en la transliteración de términos desconocidos o poco frecuentes, especialmente anglicismos y nombres propios.
- El modelo emite un bloque `` vacío al inicio de cada respuesta; debe eliminarse en producción mediante `"think": false` y limpieza de etiquetas.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo se distribuye sin garantías y con resultados de evaluación limitados a dos conjuntos de prueba pequeños.
- No se documentan sesgos específicos más allá de la cobertura limitada del corpus de entrenamiento (Wikipedia y frases cotidianas del equipo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/narjisb99/qwen3-0.6b-roman-urdu-to-urdu
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset Dakshina: https://huggingface.co/datasets/google-research-datasets/dakshina
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- Ollama: https://ollama.com
