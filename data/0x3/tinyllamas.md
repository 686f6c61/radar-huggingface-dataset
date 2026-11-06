# 0x3/tinyllamas

## Resumen

TinyLLaMA es una serie de modelos con arquitectura Llama 2 entrenados sobre el conjunto de datos TinyStories, publicados por el usuario 0x3 en Hugging Face. El objetivo declarado es servir de pesos compatibles con el proyecto llama2.c de Andrej Karpathy, un motor de inferencia minimalista escrito en C que permite ejecutar modelos Llama 2 en hardware muy modesto, incluso en CPU o en dispositivos embebidos.

El repositorio, de aproximadamente 1,3 GB, agrupa varios checkpoints de distintos tamanos de la familia TinyLLaMA (tipicamente en el rango de 1M a 100M de parametros, aunque el autor no detalla la lista exacta en la model card). El entrenamiento sobre TinyStories, un corpus sintetico de cuentos infantiles generado con GPT-3.5 y GPT-4, produce modelos capaces de generar texto narrativo gramaticalmente coherente con un vocabulario muy reducido, lo que los convierte en un banco de pruebas ideal para investigacion en eficiencia y para validar implementaciones de inferencia.

La relevancia actual es doble: por un lado, ofrece pesos de referencia para quienes trabajan con llama2.c o quieren experimentar con modelos de lenguaje en entornos con recursos minimos; por otro, la licencia MIT facilita su uso, modificacion y redistribucion sin las restricciones de la licencia Llama original. La model card es extremadamente escueta y no aporta detalles sobre arquitectura exacta, contexto, tokenizador ni hiperparametros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con arquitectura Llama 2 (RMSNorm, SwiGLU, RoPE) |
| Parametros totales | no disponible (serie con varios tamanos, sin detallar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compatible con las soportadas por llama2.c, tipicamente fp32 y variantes enteras) |
| Idiomas soportados | no disponible (TinyStories es predominantemente en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (orientado a llama2.c; el repo pesa 1,3 GB) |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de una serie de modelos con arquitectura Llama 2 entrenada sobre TinyStories. Esto implica, por la definicion de la arquitectura Llama 2, un transformer decoder-only con normalizacion RMSNorm previa a la atencion y al MLP, activacion SwiGLU, embeddings rotatorios (RoPE) para la posicion y atencion causal. No se especifican el numero de capas, dimensiones ocultas, cabezas de atencion ni el vocabulario del tokenizador.

TinyStories es un dataset sintetico compuesto por cuentos cortos generados por modelos GPT-3.5 y GPT-4, disenado para estudiar el surgimiento de capacidades linguisticas en modelos pequenos. Los modelos entrenados sobre este corpus aprenden gramatica y coherencia narrativa basica con un vocabulario muy limitado, pero no adquieren conocimiento factual ni capacidades de razonamiento general. No se documenta en la model card si hubo RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento, ni el numero de tokens vistos.

## Capacidades

- Generacion de texto narrativo corto en ingles, con coherencia gramatical y estructura de cuento simple.
- Razonamiento muy limitado: el modelo esta entrenado exclusivamente sobre cuentos infantiles sinteticos y no generaliza a tareas logicas o matematicas.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilingue: no disponible; el corpus de entrenamiento es casi con certeza solo en ingles.
- Sin modo thinking, vision ni audio.
- Capacidad de ejecucion en llama2.c, lo que permite inferencia en C puro sobre CPU y dispositivos con memoria muy limitada.

## Casos de uso

- Validacion de implementaciones de llama2.c: los pesos sirven para comprobar que un port o una modificacion del motor de Karpathy produce las salidas esperadas, gracias a su pequeno tamano y a la licencia MIT.
- Experimentacion educativa con modelos de lenguaje: permite entrenar y ejecutar un transformer completo en un portatil, lo que lo hace util en cursos de aprendizaje automatico.
- Investigacion sobre el fenomeno de emergencia de capacidades: replicar el setup de TinyStories para estudiar como la gramatica y la coherencia narrativa aparecen con el escalado de parametros y datos.
- Benchmarking de tecnicas de cuantizacion: al ser un modelo diminuto, se puede cuantizar a 4 u 8 bits y medir el impacto en perplejidad y latencia sin coste de GPU.
- Pruebas de integracion en pipelines de generacion de texto: sirve como modelo de juguete para validar APIs, colas de mensajes y sistemas de streaming antes de desplegar modelos grandes.
- Generacion de cuentos sinteticos para aumentar datos de entrenamiento de modelos mas pequenos o para pruebas de sistemas de moderacion de contenido.
- Demos en dispositivos embebidos o navegador: su tamano permite ejecutarlo en WebAssembly o en microcontroladores con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; para un modelo de decenas de millones de parametros, la inferencia en fp32 requiere del orden de cientos de MB, y en cuantizacion de 8 bits, decenas de MB.
- GPU recomendadas: cualquier GPU consumer moderna es mas que suficiente; el modelo esta pensado para ejecutarse en CPU.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente, y tambien en CPU.
- Opciones de despliegue: llama2.c (motor de referencia), y potencialmente llama.cpp u Ollama si los pesos se convierten al formato GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles; dependen del tamano concreto del checkpoint y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLLaMA (0x3) | no disponible (serie) | no disponible | TinyStories | MIT | Hugging Face |
| TinyStories-1M/33M (roneneldan) | 1M-33M | no disponible | TinyStories | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | SlimPajama + code | Apache 2.0 | Hugging Face |
| Llama 2 7B | 7B | 4096 | corpus web + RLHF | Llama 2 license | Meta |

La comparativa con TinyLlama-1.1B y Llama 2 7B es solo orientativa: esos modelos estan entrenados sobre corpus generales y tienen capacidades muy superiores. Los modelos de roneneldan sobre TinyStories son los mas directamente comparables, aunque no se dispone de datos de rendimiento cruzados en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre cuentos sinteticos: no tiene conocimiento factual, no responde preguntas generales y alucinara sin control fuera del dominio narrativo.
- Sesgos: el corpus TinyStories fue generado por GPT-3.5 y GPT-4, por lo que puede heredar sesgos de esos modelos, aunque no se documenta un analisis especifico.
- Idioma: probablemente solo ingles; no se garantiza un comportamiento correcto en castellano.
- Contexto: no documentado; los modelos TinyStories suelen tener ventanas de contexto cortas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias de ningun tipo.
- La model card no documenta hiperparametros, tokenizador ni proceso de entrenamiento, lo que dificulta la reproducibilidad.
- No apto para produccion en tareas de negocio reales: su utilidad es educativa y de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/0x3/tinyllamas
- Proyecto llama2.c: https://github.com/karpathy/llama2.c
- Dataset TinyStories (paper): https://arxiv.org/abs/2305.07759
- Repositorio TinyStories en Hugging Face: https://huggingface.co/datasets/roneneldan/TinyStories
