# francesca9805/eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407

## Resumen

El modelo `eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407` es un ajuste fino (SFT) del checkpoint base `francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407`, desarrollado por el usuario de Hugging Face francesca9805. Por la nomenclatura del identificador, el modelo esta orientado a la generacion de texto en euskera (codigo de idioma `eus`), con escritura en alfabeto latino (`latn`), y parece formar parte de una linea de experimentos de tokenizacion y preentrenamiento sobre corpus de aproximadamente 10 MB, empaquetados en secuencias de 100 MB.

Tecnicamente es un transformer decoder-only de tipo GPT-2 con 39.087.104 parametros (unos 39 M), lo que lo situa en la categoria de modelos pequenos de investigacion. Se ha entrenado con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0, con seguimiento en Weights & Biases. Su relevancia es acotada: no compite con modelos de proposito general, sino que sirve como artefacto reproducible para estudiar el efecto de decisiones de tokenizacion y empaquetado de datos en lenguas de bajos recursos como el euskera.

La model card es minima y no documenta composicion del dataset, numero de tokens de entrenamiento, licencia efectiva ni idiomas oficialmente soportados. Cualquier uso en produccion debe partir de esa base: se trata de un checkpoint experimental, no de un modelo listo para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 39.087.104 (aproximadamente 39 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/GGUF, aunque no documentada por el autor) |
| Idiomas soportados | No disponibles oficialmente; por nomenclatura, orientado a euskera en alfabeto latino |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407 |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Frameworks | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Tamano del repositorio | 5,1 GB |
| Descargas | 503 |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuracion clasica de GPT-2: atencion causal multi-cabeza, embeddings posicionales aprendidos y capas de normalizacion previas a la atencion y al MLP. Con 39 M de parametros, el modelo es aproximadamente un orden de magnitud menor que GPT-2 small (124 M), lo que sugiere una configuracion reducida en numero de capas, dimension oculta o vocabulario. No se dispone de la configuracion exacta (`config.json`) en la informacion proporcionada.

El entrenamiento consistio en un ajuste supervisado (SFT) sobre el checkpoint base, ejecutado con TRL y registrado en Weights & Biases en el proyecto `new-tokenizers` de la organizacion `f-padovani-university-of-groningen`. El nombre del experimento sugiere una comparativa de tokenizadores sobre un corpus de euskera de 10 MB empaquetado en bloques de 100 MB, con un checkpoint intermedio en el paso 500 y semilla 3407. No se documentan el numero total de tokens vistos, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en el dominio e idioma del corpus de entrenamiento (presumiblemente euskera).
- Conversacion de un solo turno mediante plantilla de chat, segun el ejemplo de `pipeline` de la model card.
- Ajuste fino adicional: al ser un modelo pequeno y con pesos en safetensors, puede reentrenarse en hardware modesto.
- No hay evidencia documentada de soporte de tool calling ni de function calling.
- No hay evidencia documentada de razonamiento multi-paso, modo thinking ni capacidades de agente.
- No hay evidencia de capacidades de vision, audio ni multimodalidad.
- Cobertura multilingue no documentada; el identificador sugiere un alcance monoidioma (euskera).

## Casos de uso

- Investigacion sobre tokenizacion en lenguas de bajos recursos: el modelo sirve como punto de comparacion reproducible para medir como distintas estrategias de tokenizacion afectan a la perplejidad y a la calidad de generacion en euskera.
- Reproduccion de experimentos academicos: al estar entrenado con TRL y versiones fijadas de Transformers y PyTorch, permite replicar el pipeline de SFT en un entorno controlado.
- Generacion de texto de dominio restringido: util para completar frases o parrafos en euskera dentro del registro del corpus de entrenamiento, con expectativas limitadas de coherencia mas alla de unos pocos tokens.
- Ajuste fino posterior (continued pretraining o SFT) sobre corpus especificos: sus 39 M de parametros permiten iterar rapidamente en una unica GPU consumer.
- Docencia y formacion: ejemplo practico de ciclo completo de entrenamiento (tokenizacion, empaquetado de datos, SFT, seguimiento con W&B) para cursos de PLN.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines de text-generation-inference, endpoints compatibles y `transformers.pipeline` antes de escalar a modelos mayores.
- Analisis de sesgos y calidad linguistica en euskera: permite estudiar que errores comete un modelo pequeno entrenado con pocos datos, como paso previo a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 160 MB solo para pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en fp16/bf16: alrededor de 80 MB para pesos; en cuantizacion de 8 bits, unos 40 MB; en 4 bits, unos 20 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien funciona en CPU para inferencia interactiva.
- Cabe en GPU consumer: si, en practicamente todas las disponibles en el mercado desde 2018.
- Opciones de despliegue: `transformers` (libreria nativa), text-generation-inference (el repo incluye el tag `text-generation-inference`), endpoints compatibles, y conversion a GGUF para llama.cpp u Ollama si se desea.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera una latencia de milisegundos por token en GPU y decenas de milisegundos por token en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407 | 39 M | No disponible | No disponible | Euskera, investigacion de tokenizacion |
| GPT-2 small | 124 M | 1024 tokens | MIT | Ingles, proposito general |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ingles, destilado |
| Modelos GPT-2 ajustados a lenguas minoritarias (varios autores) | 100-150 M | 1024 tokens | Variable | Lenguas de bajos recursos |

La comparativa es orientativa: no hay benchmarks publicados de este modelo que permitan una comparacion cuantitativa con las alternativas. La diferencia principal es el enfoque monoidioma y el caracter experimental del checkpoint.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, numero de tokens, hiperparametros ni criterios de evaluacion.
- Licencia no especificada de forma efectiva (`licence: license` sin contenido): no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo alto de alucinacion y de generar texto incoherente fuera del dominio del corpus de entrenamiento, dado el reducido tamano (39 M) y el volumen limitado de datos (10 MB).
- Cobertura idiomatica no verificada; es probable que el modelo solo funcione de forma aceptable en euskera y produzca salidas degeneradas en otros idiomas.
- Longitud de contexto no documentada; no debe asumirse una ventana superior a la de GPT-2 estandar (1024 tokens) sin verificacion.
- Sesgos desconocidos: al no publicarse la composicion del corpus, no es posible evaluar sesgos de genero, etnicos o politicos.
- Checkpoint intermedio (paso 500): puede no representar el mejor estado del entrenamiento; conviene comprobar si existe un checkpoint final en el repositorio del autor.
- No apto para tareas de razonamiento, codigo o matematicas: no hay evidencia de que el entrenamiento haya cubierto esos dominios.
- Sin garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/zcv71tl2
- Repositorio TRL: https://github.com/huggingface/trl
