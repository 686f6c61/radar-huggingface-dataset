# DedeBckp/BackKiyo-10M

## Resumen

BackKiyo-10M es un modelo de lenguaje compacto tipo decoder-only, desarrollado por DedeBckp, cuenta de respaldo de DedeProGames, como parte de la familia Kiyo. Se entrenó desde cero con 20 000 millones de tokens procedentes de tres conjuntos de datos públicos: FineWeb-Edu, DCLM-Baseline y FinePhrase. Su arquitectura sigue el estilo Qwen3, con atención de consultas agrupadas (GQA), normalización RMSNorm, MLPs con activación SwiGLU, codificación posicional RoPE y embeddings de entrada y salida compartidos.

Con 9 976 832 parámetros, este modelo se sitúa por debajo de los 10 millones, lo que lo convierte en un ejemplo representativo de LM a escala mínima. La ventana de contexto utilizada durante el entrenamiento es de 2048 tokens. Se trata de un modelo base, sin ajuste por instrucciones ni alineación mediante RLHF o DPO, orientado a la continuación de texto y pensado para la experimentación, la docencia y la validación de arquitecturas eficientes en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (decoder-only compacto) |
| Parametros totales | 9 976 832 |
| Longitud de contexto | 2048 tokens (usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BackKiyo-10M utiliza una arquitectura Qwen3ForCausalLM con 7 capas, tamaño de ocultación 384, 6 cabezas de atención y 2 cabezas clave-valor, con una dimensión de cabeza de 64. El tamaño intermedio de los MLPs es de 700 y el vocabulario consta de 8192 tokens. La atención emplea GQA, la normalización es RMSNorm, la activación es SwiGLU/SiLU y las posiciones se codifican mediante RoPE. Además, los embeddings de entrada y la cabeza de salida están compartidos, lo que reduce el número de parámetros.

El preentrenamiento se realizó desde una inicialización aleatoria en precisión bfloat16 con un total de 20 000 millones de tokens, distribuidos entre FineWeb-Edu (texto web filtrado educativo), DCLM-Baseline (texto web de alta calidad) y FinePhrase (datos de lenguaje de alta calidad). No se ha aplicado ningún proceso posterior de alineación, como RLHF o DPO; el modelo se publica exclusivamente como base.

## Capacidades

- Generacion de texto por continuacion: muestra un rendimiento relativo bueno en tareas de completado de lenguaje, con 72 % de precisión en la categoria Language completion del benchmark propio.
- Conocimiento factual basico: alcanza un 48 % de precisión en World knowledge, lo que indica cierta capacidad para recuperar hechos comunes.
- Razonamiento logico elemental: obtiene un 40 % de precisión en Logical reasoning, con una significancia estadistica marginal.
- Sin soporte para tool calling ni function calling: al tratarse de un modelo base sin ajuste instructivo, no esta disenado para invocar herramientas ni para interactuar con APIs.
- Sin capacidad de agentes ni razonamiento multi-paso avanzado: el rendimiento en tareas de Context tracking es bajo (28 %).
- Sin capacidades multimodales: no se menciona vision, audio ni otro tipo de entrada distinta del texto.
- Idiomas soportados no declarados: la informacion oficial no especifica los idiomas cubiertos.

## Casos de uso

- Educacion y experimentacion en NLP: sirve como ejemplo practico de un modelo de lenguaje entrenado desde cero con datos publicos. Puede utilizarse en talleres o cursos para explicar el pipeline de preentrenamiento, tokenizacion y evaluacion con un coste computacional minimo.
- Investigacion en arquitecturas eficientes: su combinacion de GQA, peso compartido de embeddings y tamano reducido permite estudiar el impacto de estas tecnicas en modelos de menos de 10 millones de parametros, facilitando analisis de escalado con recursos limitados.
- Autocompletado de texto en aplicaciones locales: gracias a su tamano, los pesos en bfloat16 ocupan aproximadamente 20 MB, por lo que puede integrarse en editores o herramientas de escritorio para sugerir continuaciones de frases sin depender de servicios en la nube.
- Base para fine-tuning en dominios especificos: al ser un modelo base, es posible ajustarlo con datasets pequenos para tareas concretas, como clasificacion de textos o generacion condicionada en un dominio acotado, siempre que la calidad requerida sea modesta.
- Pruebas de integracion de librerias: puede emplearse como modelo minimo para validar pipelines con Transformers, tokenizacion, generacion y gestion de dispositivos en entornos CI/CD, reduciendo el tiempo y el espacio de despliegue.
- Baseline en benchmarks de modelos pequenos: los resultados en BananaMind Base Bench 1.1 aportan una referencia cuantitativa para comparar futuros modelos de tamano similar dentro de la misma suite.

## Benchmarks y rendimiento

Los datos presentados corresponden a la suite BananaMind Base Bench 1.1, reportada por el autor. La evaluacion incluye 350 ejemplos, divididos en siete categorias de 50 ejemplos cada una, con cuatro continuaciones candidatas por ítem y puntuacion mediante log-probabilidad condicional media.

| Categoria | Precision | Elo | Significativo |
|---|---|---:|---|
| Language completion | 72.0 % | 1 070 | * |
| World knowledge | 48.0 % | 920 | * |
| Logical reasoning | 40.0 % | 973 | * |
| Commonsense | 36.0 % | 860 | |
| Quantitative | 34.0 % | 915 | |
| Context tracking | 28.0 % | 815 | |
| Code completion | 26.0 % | 924 | |

\* = supera 1.96 sigma sobre el azar; n=50 por categoria.

| Dificultad | Precision |
|---|---|
| Facil | 46.2 % |
| Media | 40.2 % |
| Dificil | 35.3 % |

| Metrica | Valor |
|---|---|
| Elo global | 920 |
| Suelo del azar | 805 |
| Margen sobre el azar | +115 |
| Precision bruta | 40.6 % |
| Intervalo de confianza 95 % | [35.4 %, 45.7 %] |
| z vs. azar | +6.73 |
| Resultado estadistico | Significativo |
| Ejemplos evaluados | 350 |
| Secuencias puntuadas | 1 400 |
| Secuencias truncadas | 0 |
| Continuaciones truncadas | 0 |

No se han publicado comparativas con otros modelos en la informacion disponible. Los resultados son autoreportados y pueden variar segun la version del benchmark, la version de Transformers, el dtype, el hardware y la configuracion de evaluacion.

## Requisitos de hardware

- VRAM estimada: partiendo de 9 976 832 parametros, los pesos en bfloat16 ocupan alrededor de 20 MB. La memoria adicional para activaciones y logits es dependiente de la longitud de la secuencia, pero en cualquier caso se trata de una carga muy baja.
- GPU recomendadas: no se han publicado recomendaciones oficiales. Por su tamano, cualquier GPU moderna, incluidas las de gama de consumo como la RTX 3060, es suficiente. Tambien es viable la inferencia en CPU.
- Compatibilidad con GPU de consumo: si, el modelo cabe con holgura en GPU de consumo y en integradas.
- Opciones de despliegue: la unica via documentada es Transformers, usando torch.bfloat16 o torch.float32 segun disponibilidad. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones oficiales de velocidad.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables. Dentro de la familia Kiyo existe un modelo mayor, Kiyo-135M, pero no se disponen de especificaciones ni resultados que permitan una comparacion directa con BackKiyo-10M.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue instrucciones ni sostiene conversaciones de forma fiable.
- Su capacidad es muy limitada por el tamano: los resultados en tareas complejas como seguimiento de contexto, codigo o razonamiento cuantitativo son bajos.
- Puede generar hechos incorrectos, texto inconsistente o repeticiones, especialmente en secuencias largas o dificiles.
- La ventana de contexto es corta (2048 tokens), lo que limita el manejo de documentos extensos o dependencias de largo alcance.
- No debe utilizarse en decisiones de alto riesgo sin verificacion independiente de las salidas.
- No se ha publicado una evaluacion de sesgos ni una especificacion de los idiomas soportados.
- Los benchmarks son autoreportados y pueden no ser reproducibles con exactitud en configuraciones diferentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DedeBckp/BackKiyo-10M
- Modelo relacionado Kiyo-135M: https://huggingface.co/DedeProGames/Kiyo-135M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FinePhrase: https://huggingface.co/datasets/HuggingFaceFW/finephrase
