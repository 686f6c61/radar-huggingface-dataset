# Convergent-ch/Alpina-Endas-2.2-AoM-Giant

## Resumen

Alpina Endas 2.2 AoM Giant es un paquete experimental de inferencia multiagente publicado por Convergent-ch bajo la etiqueta "Army of Models" (AoM) de AlpinaAI. No es un unico checkpoint denso ni un modelo MoE entrenado, sino un runtime de comunicacion en Python que orquesta dos bases compartidas de la familia Qwen2.5 (una de 7B y otra de 14B en cuantizacion 4 bits) junto con nueve adaptadores LoRA entrenados: planificacion, sintesis, codigo, logica, matematicas, fisica, ayuda/chat, conocimiento general e investigacion. El repositorio empaqueta las bases, los adaptadores, 200 copias de especialistas, tokenizadores, scripts de instalacion, verificacion de ficheros y tests.

La propuesta conceptual es repartir una consulta entre 202 contextos de conversacion: un Input-Divisor de planificacion (14B) genera un grafo de dependencias, 200 especialistas de 7B responden en contextos separados y un Input-Divisor de sintesis (14B) revisa 17 grupos y compone la respuesta final. Cada intercambio normal implica 219 llamadas al modelo, con las bases cargadas de forma secuencial. El autor advierte explicitamente de que la suma aritmetica de 200 × 7B + 2 × 14B = 1,428T no representa parametros unicos aprendidos: las copias comparten pesos y no multiplican la capacidad real del sistema.

El modelo es relevante como experimento de orquestacion multiagente sobre modelos abiertos de tamano medio, pero no debe confundirse con un modelo fundacional nuevo. La inferencia real no se ejecuto durante la publicacion, las pruebas de comunicacion usaron respuestas simuladas y el propio autor reconoce que los requisitos minimos de hardware y la calidad de respuesta no estan verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime multiagente sobre transformers Qwen2.5 (bases densas 7B y 14B) con 9 adaptadores LoRA; no es un MoE entrenado |
| Parametros totales | 200 copias de 7B + 2 instancias de 14B (suma nominal 1,428T, no son parametros unicos aprendidos) |
| Parametros activos | No aplica (no es MoE); las copias comparten pesos y se cargan secuencialmente |
| Longitud de contexto | No disponible (heredada de Qwen2.5, sin especificar en la model card) |
| Tipos de cuantizacion | Base de 14B en bnb-4bit; base de 7B sin cuantizacion indicada; no se documentan otros formatos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bases y adaptadores); paquete completo de ~25,2 GB en el repo, ~27 GB descargados |

## Arquitectura y entrenamiento

El sistema se compone de dos bases compartidas: Qwen2.5-7B-Instruct (para los siete especialistas) y Qwen2.5-14B-Instruct en cuantizacion 4 bits de unsloth (para los dos Input-Divisors de planificacion y sintesis). Sobre ellas se entrenaron nueve adaptadores LoRA: planificacion, sintesis, codigo, logica, matematicas, fisica, ayuda/chat, conocimiento general e investigacion. Los dos Input-Divisors completaron 400 pasos de optimizador; los pasos y checkpoints de los especialistas se registran individualmente en `reports/training/`. Las 200 copias de especialistas dentro de una misma familia usan pesos identicos y solo se diferencian por mensajes y contextos separados.

El flujo de comunicacion es un grafo dirigido: el Input-Divisor de planificacion devuelve un grafo de dependencias verificado, los 200 especialistas contribuyen con extractos atribuidos de dependencias y pares, y el Input-Divisor de sintesis revisa 17 grupos y combina sus revisiones en la respuesta final. Un intercambio normal realiza 219 llamadas a traves de 202 identidades, con las bases cargadas de forma secuencial, no todas las copias en paralelo. Los mensajes completos se guardan localmente y los intercambios interrumpidos se pueden reanudar. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general mediante la base Qwen2.5-7B-Instruct y el adaptador de conocimiento.
- Planificacion estructurada: el Input-Divisor de planificacion produce un grafo de dependencias entre especialistas.
- Sintesis multiagente: el Input-Divisor de sintesis agrega revisiones de 17 grupos en una respuesta final.
- Codigo: adaptador especifico con 100 contextos dedicados; el codigo se devuelve como texto, no se ejecuta.
- Logica formal y matematicas: adaptadores especificos con 20 contextos cada uno.
- Fisica: adaptador con tareas acotadas de formulas y seleccion de respuestas.
- Investigacion sobre evidencia suministrada: extraccion de fuentes y verificacion de evidencia; no incluye navegador ni recuperacion en vivo.
- Conversacion de ayuda y chat general mediante adaptador especifico.
- Trazabilidad: cada contribucion queda atribuida a su especialista y se guardan mensajes completos en local.
- Reanudacion de intercambios interrumpidos mediante `--resume`.
- No se documenta soporte nativo de tool calling, function calling ni vision en la informacion disponible.

## Casos de uso

- Experimentacion con orquestacion multiagente: el paquete permite reproducir un grafo de 202 contextos con dependencias verificadas, util para investigar como se comporta la agregacion de respuestas cuando cada especialista ve solo su contexto.
- Analisis de codigo con revision por pares: los 100 contextos de codigo pueden generar propuestas independientes y el sintetizador compararlas; el resultado se devuelve como texto para revision humana, no ejecucion.
- Verificacion de evidencia documental: el adaptador de investigacion extrae y contrasta afirmaciones contra fuentes suministradas, adecuado para auditar informes donde no se requiere busqueda web en vivo.
- Razonamiento matematico y fisico acotado: los adaptadores de matematicas y fisica permiten resolver problemas con seleccion de formulas y respuestas, con la salvedad de que pueden repetir errores.
- Chat de asistencia tecnica multi-turno: el adaptador de ayuda/chat con 20 contextos sirve para conversaciones de soporte donde se quiere separar la memoria por hilo.
- Docencia y prototipado de sistemas multiagente: el runtime incluye tests offline con salidas falsas (`python run.py simulate`) que permiten estudiar el protocolo de comunicacion sin cargar modelos.
- Investigacion sobre escalado por replicacion: las 200 copias con pesos identicos permiten medir el coste real de paralelizar contextos frente a aumentar parametros unicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las perdidas de entrenamiento, desarrollo y test estan en `reports/training/`, pero advierte que las pruebas de comunicacion se hicieron con respuestas simuladas y no miden la calidad real del modelo ni prueban la inferencia end-to-end. Algunos ejemplos de held-out proceden del split de desarrollo anterior, por lo que no son resultados externos limpios.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el paquete completo ocupa ~27 GB en disco y requiere cargar secuencialmente una base de 7B y una de 14B en 4 bits, ademas de los adaptadores.
- GPU recomendadas: no verificadas por el autor; el backend apunta a NVIDIA CUDA 12.6 en Windows o Linux, por lo que se presupone una GPU NVIDIA compatible con esa version de CUDA.
- Cabe en GPU de consumo: no confirmado. La base de 14B en 4 bits y la de 7B podrian caber en GPUs de 24 GB si se cargan secuencialmente, pero el autor no lo garantiza.
- Opciones de despliegue: runtime propio en Python (`run.py`, `install.ps1`, `install.sh`); no es compatible con Ollama sin modificaciones ni con `AutoModelForCausalLM.from_pretrained` en la raiz del repo. No se reclama integracion funcional con Ollama o GGUF.
- Latencia y throughput: no disponibles. Un intercambio normal implica 219 llamadas con carga secuencial de bases, lo que sugiere una latencia alta, pero no se aportan numeros.
- Requisitos de entorno: Python 3.12, `huggingface-hub==2.3.0`, dependencias CUDA 12.6 fijadas, memoria de host suficiente y espacio adicional para el entorno Python y PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpina Endas 2.2 AoM Giant | 200 × 7B + 2 × 14B (suma nominal, pesos compartidos) | No disponible | Runtime multiagente con 9 LoRA sobre Qwen2.5 | Apache 2.0 | Hugging Face, paquete de ~27 GB |
| Qwen2.5-7B-Instruct | 7B | 128K (segun Qwen2.5) | Transformer denso instruct | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Qwen2.5-14B-Instruct | 14B | 128K (segun Qwen2.5) | Transformer denso instruct | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Modelos MoE abiertos tipo Mixtral 8x7B | 46,7B totales, ~12,9B activos | 32K | MoE disperso entrenado | Apache 2.0 | Hugging Face, soporte en vLLM y llama.cpp |

La comparativa con Qwen2.5 refleja las bases subyacentes; el valor diferencial de AoM Giant es el protocolo de orquestacion, no la capacidad de los pesos. Frente a un MoE real, las copias de 7B no aportan capacidad aprendida adicional y el coste computacional es mucho mayor por llamada.

## Limitaciones y advertencias

- La suma de 1,428T parametros es aritmetica nominal: las 200 copias comparten pesos y no constituyen capacidad aprendida adicional ni verificacion independiente de ninguna afirmacion.
- La inferencia real no se ejecuto durante la publicacion; esta deshabilitada salvo que el usuario la active explicitamente con `--allow-inference`.
- Los requisitos minimos de hardware y la calidad de respuesta no estan verificados por el autor.
- Las pruebas de comunicacion usaron respuestas simuladas y no demuestran que la inferencia end-to-end funcione en un dispositivo concreto.
- Algunos ejemplos held-out proceden del split de desarrollo anterior, por lo que no son benchmarks externos limpios.
- El modelo solo declara soporte de ingles; no se documentan capacidades multilingues.
- El codigo generado se devuelve como texto y no se ejecuta; no hay sandbox de ejecucion.
- El adaptador de investigacion trabaja solo sobre fuentes suministradas, sin navegador ni recuperacion en vivo.
- Se reconocen respuestas repetidas o incorrectas, especialmente en fisica y matematicas.
- No es compatible con Ollama sin modificaciones ni con carga directa desde la raiz del repositorio; requiere el runtime Python incluido.
- El backend solo apunta a NVIDIA CUDA en Windows o Linux; no hay soporte para Apple Silicon ni inferencia en movil.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de calidad ni de idoneidad para produccion.
- No se han documentado sesgos especificos; al heredar Qwen2.5, arrastra los sesgos conocidos de esa familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-Giant
- Modelo base 7B: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base 14B en 4 bits: https://huggingface.co/unsloth/Qwen2.5-14B-Instruct-bnb-4bit
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Cliente de descarga: https://pypi.org/project/huggingface-hub/2.3.0/
- Documentacion de referencia del paquete: `NOTICE.md` y `reports/data-sources.json` dentro del repositorio
