# fbaldassarri/sapienzanlp_Minerva-3B-base-v1.0-auto_round-int4-gs64-sym

## Resumen

Minerva-3B-base-v1.0 es un modelo de lenguaje de la familia Mistral, desarrollado por el grupo de procesamiento del lenguaje natural de la Universidad de Roma "La Sapienza" (Sapienza NLP), orientado principalmente al italiano y con soporte secundario en inglés. Esta ficha describe la versión cuantizada a 4 bits mediante el algoritmo AutoRound (SignRound) de Intel, publicada por el usuario fbaldassarri. El objetivo de esta cuantización es reducir el consumo de memoria y acelerar la inferencia en hardware Intel (CPU, iGPU Arc y NPU), manteniendo una pérdida de precisión mínima.

Aunque el nombre del modelo indica 3B parámetros, los pesos reales almacenados en safetensors suman 556.648.960 parámetros (~556M), un dato relevante para dimensionar correctamente los requisitos de hardware. La cuantización es simétrica, con grupo de tamaño 64 (W4G64), y se realizó sobre el modelo base sin fine-tuning instructivo, por lo que se comporta como un modelo de completado de texto. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder-only, causal LM) |
| Parametros totales | 556.648.960 (~556M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4, group size 64, simetrica (W4G64) |
| Idiomas soportados | Italiano, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round) |

## Arquitectura y entrenamiento

El modelo base es `sapienzanlp/Minerva-3B-base-v1.0`, un transformer causal de tipo Mistral entrenado por Sapienza NLP para generacion de texto en italiano e ingles. Esta version concreta no ha sido reentrenada, sino cuantizada con el framework Intel AutoRound v0.13.1, que implementa el algoritmo SignRound (una variante de weights-only quantization). El proceso de calibracion se realizo en CPU con 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch size 4, usando `torch.bfloat16` como tipo de dato de referencia. La cuantizacion es simetrica con group size 64, lo que reduce el peso de cada tensor a 4 bits por valor.

Al ser una cuantizacion solo de pesos (WoQ), no se modificaron los pesos originales durante el entrenamiento; solo se ajustaron los rangos de cuantizacion mediante optimizacion de signos. Esto implica que las capacidades del modelo base se conservan en gran medida, con una degradacion esperada tipica de W4G64 (ligera caida de precision en tareas complejas). El modelo esta pensado para inferencia en entornos con recursos limitados, especialmente hardware Intel.

## Capacidades

- Generacion de texto por completado: al ser un modelo base, responde continuando un prompt de texto libre sin formato de chat.
- Bilingue italiano-ingles: entrenado principalmente en italiano, con soporte secundario en ingles; adecuado para tareas de generacion en ambos idiomas.
- Inferencia eficiente en CPU y hardware Intel: la cuantizacion INT4 permite ejecutar el modelo en CPU Intel, iGPU Arc (via intel-extension-for-pytorch) y NPU (AI Boost en Core Ultra, via OpenVINO) con aceleracion 2-3x respecto al modelo original en FP16.
- Compatible con transformers: se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` de HuggingFace, lo que facilita su integracion en pipelines existentes.
- No soporta tool calling ni modo agente: al ser un modelo base sin fine-tuning instructivo, no dispone de capacidades de function calling, razonamiento multi-paso ni modo thinking.
- Sin capacidades multimodales: no procesa vision, audio ni otros formatos; solo texto.

## Casos de uso

- Generacion de texto en italiano para aplicaciones de escritura asistida: el modelo puede completar articulos, correos o contenido creativo en italiano, aprovechando su entrenamiento especifico en ese idioma. Su tamano reducido permite ejecutarlo en portatiles o servidores modestos.
- Clasificacion y etiquetado de texto ligero: mediante fine-tuning posterior, puede adaptarse a tareas de clasificacion (sentimiento, topicos) en italiano, con la ventaja de un peso de ~278 MB en INT4, ideal para despliegue en edge.
- Prototipado rapido de aplicaciones NLP: al ser un modelo pequeno y cuantizado, es util para validar ideas o construir demos sin necesidad de GPUs de alta gama, usando solo CPU.
- Inferencia en entornos sin GPU: gracias a su optimizacion para CPU Intel y NPU, puede desplegarse en mini-PCs, portatiles con Core Ultra o incluso en la nube con instancias CPU-only, reduciendo costes.
- Fine-tuning eficiente para dominios especificos: al ser un modelo base, se puede ajustar con datasets propios (p.ej. textos juridicos o medicos en italiano) y posteriormente cuantizar de nuevo, manteniendo un footprint reducido.
- Educacion e investigacion en cuantizacion: el repositorio incluye la receta exacta de cuantizacion, lo que permite a investigadores reproducir el proceso y estudiar el impacto de W4G64 en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El unico dato de rendimiento mencionado es una aceleracion estimada de 2-3x en inferencia respecto al modelo original en FP16, sin cifras concretas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en INT4 ocupan aproximadamente 278 MB (556M parametros x 0.5 bytes), mas overhead de activaciones y KV cache. En la practica, cabe en GPUs con 2-4 GB de VRAM, aunque el modelo esta disenado para CPU.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB (p.ej. GTX 1650, RTX 3050) puede ejecutarlo; tambien compatible con iGPU Intel Arc y NPU Intel Core Ultra.
- CPU: funciona en cualquier CPU x86_64, con mejor rendimiento en CPUs Intel modernas gracias a intel-extension-for-pytorch.
- Opciones de despliegue: transformers (carga directa), vLLM (si se convierte a formato compatible), llama.cpp (requiere conversion a GGUF), TGI (con adaptacion), y OpenVINO para NPU.
- Latencia y throughput: no disponibles; se estima una generacion de decenas de tokens por segundo en CPU moderna, pero sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia |
|---|---|---|---|---|---|
| Minerva-3B-base-v1.0 (original) | ~556M | No disponible | FP16/BF16 | it, en | Apache 2.0 |
| Este modelo (INT4) | ~556M | No disponible | INT4 W4G64 | it, en | Apache 2.0 |
| Otros modelos pequenos bilingues | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria (p.ej. modelos italianos pequenos como Gemma-2B o Llama-3.2-1B). La comparativa se limita a la diferencia entre el modelo original y su version cuantizada, que es la unica relacion documentada.

## Limitaciones y advertencias

- Modelo base sin fine-tuning instructivo: no sigue instrucciones ni mantiene conversaciones; solo completa texto. No es adecuado para chat o agentes sin un ajuste posterior.
- Riesgo de alucinacion y sesgos: al ser un modelo base entrenado con datos web, puede generar contenido falso, toxico o sesgado, especialmente en italiano. No se han documentado evaluaciones de sesgo.
- Degradacion por cuantizacion: la precision W4G64 introduce una ligera perdida de calidad en tareas complejas (razonamiento, matematicas) respecto al modelo original en FP16.
- Contexto limitado: la longitud de contexto no esta documentada; se recomienda asumir un valor conservador (p.ej. 2048-4096 tokens) hasta confirmarlo.
- Uso solo para investigacion: el disclaimer del autor indica que el modelo se ha desarrollado unicamente con fines de investigacion y se distribuye sin garantia.
- Compatibilidad de formato: los pesos estan en formato auto_round, no en GGUF; para usarlo con llama.cpp u Ollama es necesaria una conversion manual.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-3B-base-v1.0-auto_round-int4-gs64-sym
- Modelo base original: https://huggingface.co/sapienzanlp/Minerva-3B-base-v1.0
- Framework de cuantizacion Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
