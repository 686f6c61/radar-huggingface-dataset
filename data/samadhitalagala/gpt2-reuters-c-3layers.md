# samadhitalagala/gpt2-reuters-C-3layers

## Resumen

gpt2-reuters-C-3layers es un modelo de lenguaje causal de estilo GPT-2 entrenado desde cero (sin pesos preentrenados) por el usuario samadhitalagala sobre el conjunto de datos de articulos de Reuters (titulo y cuerpo). Se trata de un trabajo academico correspondiente a la asignatura CS4681, Assignment 02, y su proposito es demostrar el entrenamiento completo de un transformer decoder pequeno sobre un corpus especifico de dominio periodistico en ingles.

El modelo emplea una arquitectura transformer decoder clasica con 3 capas, 8 cabezas de atencion y una dimension de embedding de 512, sumando 36.213.248 parametros. Su ventana de contexto es de solo 256 tokens, lo que lo situa en la gama muy baja de modelos utilitarios y lo limita a generacion de fragmentos cortos. El entrenamiento consistio en 5 epocas con learning rate 0,0005 (cosine con 5% de warmup), batch size 32 y un tiempo total de 14,5 minutos, alcanzando una perdida de validacion de 4,281 (perplejidad 72,3) y de test de 4,075 (perplejidad 58,8).

Su relevancia es fundamentalmente didactica y de investigacion: sirve como referencia de un pipeline completo de entrenamiento from-scratch, tokenizador propio y evaluacion sobre un corpus de dominio concreto. No esta pensado para uso en produccion ni para tareas generales, dado su tamano reducido, su contexto corto y la ausencia de datos sobre licencia o alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal estilo GPT-2 |
| Parametros totales | 36.213.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de llama.cpp/GGUF, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2: un transformer decoder con atencion causal multi-cabeza. La configuracion concreta es de 3 capas, 8 cabezas de atencion y dimension de embedding de 512, con una longitud de contexto de 256 tokens. El entrenamiento parte de inicializacion aleatoria, sin reutilizar pesos de ningun modelo preentrenado, y utiliza el tokenizador `ingeniumacademy/gpt2-reuters-tokenizer`, especifico para el corpus de Reuters.

El corpus de entrenamiento es el dataset `ingeniumacademy/reuters_articles`, compuesto por titulo y cuerpo de articulos de Reuters en ingles. Se realizaron 5 epocas con learning rate 0,0005, scheduler cosine con 5% de warmup, batch size 32 y un tiempo total de 14,5 minutos. Los resultados reportados son perdida de validacion 4,281 (perplejidad 72,3) y perdida de test 4,075 (perplejidad 58,8). No se documenta el numero total de tokens de entrenamiento ni la composicion exacta del dataset, ni se indica el uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto causal en ingles, limitada a continuaciones de hasta 256 tokens por ventana.
- Modelado de lenguaje de dominio: entrenado especificamente sobre articulos de Reuters, por lo que reproduce estilo y vocabulario periodistico.
- Generacion condicionada por titulo o cuerpo de articulo como prompt.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles; no se reporta entrenamiento en otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Experimentacion academica y docencia: sirve como ejemplo completo de entrenamiento from-scratch de un transformer decoder pequeno, con tokenizador propio, configuracion de hiperparametros y evaluacion de perdida y perplejidad; util para comparar pipelines en cursos de aprendizaje automatico.
- Generacion de titulares sinteticos de estilo Reuters: dado un fragmento de cuerpo de articulo, el modelo puede producir continuaciones o titulares plausibles en el dominio periodistico, aprovechando su entrenamiento especifico sobre ese corpus.
- Pruebas de infraestructura de inferencia: por su tamano (36 M de parametros, repo de 0,3 GB), es adecuado para validar pipelines de despliegue (transformers, llama.cpp, vLLM) en entornos con recursos muy limitados antes de pasar a modelos mayores.
- Investigacion sobre sobreajuste y dominio: con 5 epocas sobre un corpus acotado, permite estudiar el equilibrio entre memorizacion y generalizacion en modelos pequenos mediante las curvas de perdida de validacion y test reportadas.
- Baseline para comparativas de arquitectura: sirve como referencia de baja capacidad (3 capas, 512 de embedding) frente a modelos GPT-2 mayores en tareas de modelado de lenguaje de dominio.
- Generacion de texto de relleno para pruebas de UI: util para poblar interfaces de demostracion con texto en ingles de estilo periodistico sin coste de inferencia relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de entrenamiento y evaluacion interna:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 4,281 |
| Perplejidad de validacion | 72,3 |
| Perdida de test | 4,075 |
| Perplejidad de test | 58,8 |
| Epocas | 5 |
| Tiempo de entrenamiento | 14,5 min |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (36 M de parametros, ~145 MB en fp32); en fp16 aproximadamente 75 MB, mas overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe incluso en CPU. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU sin problemas.
- Opciones de despliegue: transformers (PyTorch), llama.cpp/Ollama si se convierte a GGUF, y servidores de inferencia estandar. No se documenta soporte nativo en vLLM ni TGI, aunque por arquitectura GPT-2 podria ser compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpt2-reuters-C-3layers | 36,2 M | 256 | no disponible | Hugging Face |
| GPT-2 small (referencia OpenAI) | 124 M | 1024 | MIT | Hugging Face |
| GPT-2 medium (referencia OpenAI) | 355 M | 1024 | MIT | Hugging Face |
| Modelos GPT-2 from-scratch de dominio | variable | variable | variable | Hugging Face |

La comparativa con GPT-2 small y medium es orientativa: el modelo aqui descrito tiene aproximadamente un 29% de los parametros de GPT-2 small y una cuarta parte de su contexto, y esta entrenado exclusivamente sobre Reuters en lugar de un corpus web general. No se dispone de benchmarks comparativos publicados que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo sobre articulos de Reuters, hereda los sesgos editoriales, geograficos y tematicos de ese corpus; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: alto en generacion libre; el modelo es pequeno y no ha pasado por alineacion (RLHF/DPO), por lo que puede producir afirmaciones factualmente incorrectas con apariencia plausible.
- Limitacion de contexto: 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Limitacion de idioma: solo ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso en produccion.
- Caveat de produccion: es un trabajo academico (CS4681 Assignment 02) sin garantias de calidad, mantenimiento ni soporte; no esta pensado para cargas reales.
- El tokenizador es especifico del corpus de Reuters, lo que puede degradar el rendimiento fuera de ese dominio.

## Enlaces

- Hugging Face: https://huggingface.co/samadhitalagala/gpt2-reuters-C-3layers
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Log de entrenamiento: `results.json` (incluido en el repositorio del modelo)
