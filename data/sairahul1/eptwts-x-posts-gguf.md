# sairahul1/eptwts-x-posts-gguf

## Resumen

eptwts-x-posts-gguf es un ajuste fino del modelo Qwen2.5-3B-Instruct orientado a una tarea muy concreta: generar publicaciones para X (antes Twitter) con el estilo y el enfoque temático asociados a la cuenta pública de EP (@eptwts). Lo publica el usuario sairahul1 en Hugging Face y se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M, pensado para ejecutarse en local con Ollama. No es un modelo oficial de EP y el propio autor lo advierte de forma explícita en la model card.

Con 3.085.938.688 parámetros (~3,09 mil millones), se trata de un modelo denso de la familia Qwen2.5, licenciado bajo Apache 2.0 y con un repositorio de 1,9 GB. El pipeline de construcción es un QLoRA (adaptador `qwen25-3b-ep-sft-v3`) fusionado en 16 bits y posteriormente cuantizado a Q4_K_M con llama.cpp. El resultado es un artefacto de inferencia, no un modelo de propósito general: la model card insiste en que las respuestas son texto plano numerado, sin JSON ni preámbulos conversacionales.

Su relevancia es limitada y de nicho. El repositorio registra cero descargas y cero likes en el momento de la consulta, no incluye métricas de evaluación ni detalles sobre el dataset de entrenamiento, y la búsqueda web no devuelve documentación técnica asociada (únicamente resultados no relacionados). Debe considerarse, por tanto, un experimento reproducible de ajuste de estilo más que una alternativa evaluada frente a modelos generalistas del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5 (detalle no especificado en la model card) |
| Parametros totales | 3.085.938.688 (~3,09 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `eptwts-x-posts-q4_k_m.gguf`, ~1,93 GB) |
| Idiomas soportados | no disponibles (no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion Q4_K_M) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Adaptador de origen | qwen25-3b-ep-sft-v3 (QLoRA) |
| Tamano del repositorio | 1,9 GB |
| Autor | sairahul1 |
| Fecha de creacion registrada | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |
| Adopcion | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base declarado, Qwen2.5-3B-Instruct: un transformer decoder-only denso de aproximadamente 3.090 millones de parámetros. La model card no describe la configuración interna (número de capas, dimensiones, mecanismo de atención, uso de GQA o RoPE), por lo que esos datos no están disponibles. Sí se documenta que el pipeline no introduce cambios estructurales: se parte del modelo instruct, se aplica un ajuste QLoRA y se fusiona el adaptador en 16 bits antes de cuantizar, de modo que el grafo computacional es el del base.

El entrenamiento consistió en un ajuste supervisado con LoRA cuantizado (QLoRA) sobre un adaptador denominado `qwen25-3b-ep-sft-v3`. La model card menciona "prompts en lenguaje natural fieles al nicho" como característica del conjunto de datos, pero no indica el número de ejemplos, la composición del corpus, la longitud de las secuencias ni si hubo fases posteriores de RLHF, DPO u optimización por preferencias. Tampoco se documentan hiperparámetros, número de tokens vistos ni la estrategia de enmascarado de pérdida. La conversión final a GGUF se realizó con llama.cpp a Q4_K_M, una cuantización de 4 bits con mezcla de precisión en las capas más sensibles.

## Capacidades

- Generacion de texto en lenguaje natural: produce publicaciones para X en texto plano, numeradas o separadas por lineas en blanco, sin envoltorios conversacionales del tipo "Claro, aqui tienes...".
- Ajuste de estilo y tono: el ajuste esta orientado a reproducir el registro y los temas de la cuenta publica de EP (@eptwts), segun declara el autor.
- Generacion multiple en una sola llamada: la peticion de ejemplo de la model card solicita tres publicaciones y el modelo devuelve las tres en una unica respuesta.
- Instrucciones en lenguaje natural directo, sin plantillas rigidas ni esquemas estructurados.
- No soporta salida JSON ni formatos estructurados por diseno: la model card lo descarta explicitamente.
- Herramientas y function calling: no documentado; al ser un ajuste de estilo sobre Qwen2.5-3B-Instruct, no hay garantia de que la capacidad del base se conserve intacta.
- Modo thinking / razonamiento explicito: no disponible.
- Vision, audio u otras modalidades: no disponibles.
- Capacidades multilingues: no declaradas en la model card; el idioma de los ejemplos de uso es el ingles.
- Uso como agente multi-paso: no documentado y poco probable dado el objetivo del ajuste.

## Casos de uso

- Generacion de borradores de publicaciones para X en un nicho vertical: con el prompt de ejemplo ("please give 3 posts for niche dental AI automation") el modelo produce varias propuestas listas para copiar, lo que permite a un copywriter partir de material util en lugar de una pagina en blanco.
- Prellenado de calendarios editoriales: integrado en un script local que llame a Ollama, se pueden generar lotes de publicaciones por tematica y volcarlas a una hoja de calculo para su revision posterior.
- Pruebas A/B de ganchos de copy: solicitando el mismo tema varias veces se obtienen variantes con enfoques distintos, utiles para comparar tasas de interaccion antes de comprometer una linea editorial.
- Inferencia totalmente local con requisitos de privacidad: al ser un GGUF de ~1,93 GB ejecutable con Ollama, los prompts y el contenido generado nunca salen de la maquina, lo que encaja en entornos donde no se permite enviar texto a APIs de terceros.
- Plantilla de referencia para ajustes de estilo propios: el flujo documentado (QLoRA sobre Qwen2.5-3B-Instruct, fusion a 16 bits y conversion a Q4_K_M) es reutilizable para crear un generador equivalente en otro nicho o con otra voz editorial.
- Banco de pruebas para investigacion sobre estilo: permite estudiar hasta que punto un ajuste QLoRA de bajo coste sobre un modelo de 3B captura un registro concreto, y medir la perdida de calidad introducida por la cuantizacion Q4_K_M.
- Generacion de hilos y textos cortos de marketing: con temperature moderada, el modelo puede producir secuencias de publicaciones encadenadas para campañas de captacion en sectores especializados.
- Demostraciones offline en portatil: para talleres o formaciones sobre marketing con IA, un modelo de 1,9 GB arranca en cualquier equipo sin GPU dedicada y sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, GSM8K, HumanEval ni ninguna otra métrica, y la busqueda web no devuelve ningun informe tecnico asociado al repositorio. Tampoco se han publicado comparativas de calidad de las publicaciones generadas frente a las de la cuenta de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa ~1,93 GB; con overhead de contexto y cache KV, un presupuesto realista de 2,5 a 3,5 GB de VRAM para ventanas de contexto moderadas.
- Cabe en GPU de consumo: si, con holgura. Funciona en tarjetas de 4 GB o mas (GTX 1650, RTX 3050, RTX 4060), y de forma comodisima en 8 GB o mas (RTX 3060 Ti, RTX 4070, RTX 4090).
- Inferencia en CPU: viable. Al ser una cuantizacion Q4_K_M de 3B, se puede ejecutar solo con CPU y RAM (del orden de 3-4 GB de memoria disponible), con velocidades de decodificacion de un solo digito o baja decena de tokens por segundo segun el procesador.
- GPU de centro de datos: no requiere A100 ni H100; usarlas no aporta ventaja practica para un modelo de este tamano.
- Opciones de despliegue: Ollama es la via principal documentada por el autor (mediante `ollama create` con el Modelfile incluido o, opcionalmente, `ollama run hf.co/sairahul1/eptwts-x-posts-gguf`, que puede fallar por redirecciones del CDN de Hugging Face). Tambien es compatible con llama.cpp, LM Studio y cualquier frontend que consuma GGUF. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota operativa: el autor advierte de que la descarga directa desde el Hub puede fallar con el error `blocked redirect to a different host`, por lo que recomienda descargar el GGUF y el Modelfile con `huggingface-cli` y crear el modelo en local.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentacion publica de cada modelo y no de la informacion proporcionada en esta ficha, por lo que conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Evaluacion publica |
|---|---|---|---|---|---|
| eptwts-x-posts-gguf (este modelo) | ~3,09 B | no disponible | Apache 2.0 | Ajuste de estilo para posts de X; solo GGUF Q4_K_M | no disponible |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens (ampliable con YaRN en el modelo base) | Apache 2.0 | Instrucciones generales, multilingue | publicada por el autor del base |
| Llama-3.2-3B-Instruct | ~3,21 B | 128.000 tokens (segun documentacion de Meta) | Llama 3.2 Community License | Instrucciones generales | publicada por Meta |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens (segun documentacion de Microsoft) | MIT | Razonamiento e instrucciones | publicada por Microsoft |

Frente a estos tres, el modelo aquí descrito no compite en capacidades generales: es un ajuste estrecho sobre uno de ellos, sin evaluaciones y con una unica cuantizacion publicada. Su ventaja es el tamano del artefacto (1,9 GB) y la especializacion de estilo; su desventaja, la ausencia total de metricas, de soporte estructurado y de adopcion verificable.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparaciones con la cuenta de referencia, ni analisis cualitativo. No se puede afirmar nada sobre la calidad real de las publicaciones generadas.
- Riesgo de suplantacion: el propio autor advierte de que no es un modelo oficial de EP y pide atribuir la inspiracion sin hacerse pasar por la persona en X. Usarlo para publicar como si fuera EP es un riesgo reputacional y potencialmente legal.
- Sesgos: no documentados. Al entrenarse sobre el material publico de una cuenta concreta, heredara sus sesgos tematicos, su registro y sus posibles posiciones, sin ningun filtro declarado.
- Alucinacion: como cualquier modelo de 3B, puede inventar datos, cifras o afirmaciones. No hay ninguna salvaguarda documentada (RLHF, DPO ni filtros de seguridad) en este ajuste.
- Salida no estructurada: el modelo rechaza JSON por diseno. Cualquier integracion en pipeline exige parseo heurístico del texto (numeracion o lineas en blanco), lo que es fragil en produccion.
- Contexto: no declarado en la model card. Se desconoce si el ajuste preserva la ventana del modelo base y como se comporta con prompts largos.
- Idiomas: no declarados. Los ejemplos de la model card estan en ingles y no hay evidencia de comportamiento correcto en castellano.
- Cuantizacion: Q4_K_M introduce perdida de precision respecto al merge en 16 bits. No se publica ninguna comparacion entre ambos.
- Licencia: Apache 2.0 permite uso comercial, pero esa licencia cubre el artefacto tecnico, no el derecho a imitar la identidad o la marca de una persona o cuenta ajena.
- Madurez: 0 descargas y 0 likes, con una unica revision del repositorio. No hay historial de mantenimiento, issues ni soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/sairahul1/eptwts-x-posts-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Ollama: https://ollama.com
- huggingface_hub (PyPI): https://pypi.org/project/huggingface-hub/
- Paper, blog tecnico, repositorio o demo del ajuste: no disponible
- Resultados de la busqueda web: no relevantes (devuelven canales de musica y videos de YouTube sin relacion con el modelo)
