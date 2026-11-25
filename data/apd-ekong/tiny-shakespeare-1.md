# apd-ekong/tiny-shakespeare-1

## Resumen

Tiny Shakespeare 1 es un modelo de lenguaje causal a nivel de caracter entrenado desde cero sobre el corpus Tiny Shakespeare, un conjunto de texto de dominio publico compuesto por las obras de William Shakespeare. Lo publica el usuario apd-ekong en Hugging Face con fines educativos y de demostracion, no como un modelo de proposito general. Su tamano es extremadamente reducido: 226.113 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de juguete o prueba de concepto.

La arquitectura es un transformer decoder-only clasico con 4 bloques, 4 cabezas de atencion, dimension de embedding de 64 y una longitud de contexto de solo 32 caracteres. Emplea un tokenizador a nivel de caracter, por lo que el vocabulario es minimo y el modelo genera texto caracter a caracter. No dispone de informacion publicada sobre el dataset exacto, el numero de tokens de entrenamiento ni el proceso de alineacion.

Su relevancia es exclusivamente didactica: sirve para entender el ciclo completo de entrenamiento de un transformer causal, la tokenizacion por caracteres y el pipeline de `transformers`, sin pretender competir con modelos de produccion. Cualquier uso real requiere asumir que la calidad del texto generado sera limitada y que el modelo solo reproduce patrones estilisticos del corpus de Shakespeare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (4 bloques, 4 cabezas, dim 64) |
| Parametros totales | 226.113 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 caracteres |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre texto en ingles de Shakespeare) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 4 bloques de atencion multi-cabeza (4 cabezas), dimension de embedding de 64 y una ventana de contexto de 32 caracteres. Usa un tokenizador a nivel de caracter, lo que implica un vocabulario muy pequeno y una generacion secuencial caracter a caracter. El repositorio incluye codigo personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset (mas alla de Tiny Shakespeare), el uso de RLHF/DPO ni innovaciones tecnicas adicionales. El entrenamiento se realizo presumiblemente desde cero sobre el corpus Tiny Shakespeare, sin datos de alineacion ni ajuste por instrucciones.

## Capacidades

- Generacion de texto causal a nivel de caracter en el estilo de Shakespeare.
- Continuacion de fragmentos de texto con coherencia local muy limitada (contexto de 32 caracteres).
- Reproduccion de patrones ortograficos y estilisticos del corpus de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni audio.
- Uso educativo para inspeccionar el comportamiento de un transformer causal minimo.

## Casos de uso

- Docencia y talleres: usar el modelo como ejemplo minimo para explicar el pipeline de `transformers`, la carga con `trust_remote_code` y la generacion autoregresiva caracter a caracter.
- Experimentos de tokenizacion: comparar tokenizacion por caracter frente a BPE/subword en tareas de generacion con corpus literarios.
- Pruebas de infraestructura: validar pipelines de despliegue (por ejemplo, `transformers` o `text-generation-inference`) con un modelo de 226 mil parametros antes de pasar a modelos mayores.
- Generacion de texto estilizado de Shakespeare: producir continuaciones breves de fragmentos para demos o ejemplos artisticos, asumiendo baja coherencia por el contexto de 32 caracteres.
- Investigacion sobre sobreajuste: estudiar como un modelo tan pequeno memoriza el corpus Tiny Shakespeare y evaluar la fidelidad de la reproduccion.
- Benchmarking de latencia: medir tiempos de carga e inferencia en CPU/GPU con un modelo de juguete como linea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo (226.113 parametros) ocupa unos pocos cientos de KB en precision completa.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), potencialmente `text-generation-inference` u otros runners compatibles, aunque no se documenta soporte explicito para llama.cpp/Ollama.
- Latencia y throughput: no disponibles; por el tamano, la latencia sera minima en CPU y practicamente despreciable en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tiny Shakespeare 1 (apd-ekong) | 226.113 | 32 caracteres | no disponible | Hugging Face |
| Modelos de juguete tipo nanoGPT | variable (tipicamente < 1M) | variable | variable | Repositorios educativos |
| GPT-2 small | 124M | 1024 tokens | MIT (segun publicacion) | Hugging Face |

No se dispone de datos de rendimiento comparables para Tiny Shakespeare 1; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de juguete: 226.113 parametros y contexto de 32 caracteres; la coherencia y utilidad practica son muy limitadas.
- Riesgo alto de alucinacion y de texto sin sentido fuera de patrones locales.
- Sesgos: entrenado exclusivamente sobre texto de Shakespeare en ingles; no representa otros idiomas, registros ni culturas.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; revisar el codigo antes de usarlo en produccion.
- No apto para atencion al cliente, generacion de codigo, matematicas ni tareas de razonamiento.
- Idiomas soportados no declarados; no se recomienda para aplicaciones multilingues.

## Enlaces

- Hugging Face: https://huggingface.co/apd-ekong/tiny-shakespeare-1
- Corpus Tiny Shakespeare (referencia habitual): https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt
- Documentacion de `transformers`: https://huggingface.co/docs/transformers
