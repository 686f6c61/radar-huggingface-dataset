# gahabeen/Jev-Style-0.8B-Decision-v3-MLX

## Resumen

Jev-Style-0.8B-Decision-v3-MLX es la compilacion para Apple Silicon (MLX) del modelo de decision Jev-Style-0.8B-Decision-v3, un clasificador de texto de 0,8 mil millones de parametros derivado de la familia Qwen3.5. El repositorio publicado por el usuario gahabeen contiene los pesos convertidos a MLX con dos precisiones (bf16 y 8 bits afines con grupo de 64) y la model card adjunta corresponde a los builds MLX de la serie Jev-Style mantenida por chaoliangUNSW, cuyo checkpoint base declarado es chaoliangUNSW/Jev-Style-0.8B-Decision-v3. Se trata de un modelo de "estilo Jev" orientado a emitir decisiones calibradas sobre texto de entrada en lugar de generar texto abierto, con pipeline declarado de text-classification.

Su rasgo diferencial es la ventana de entrada: admite hasta 25.600 tokens por llamada, 25 veces el presupuesto por defecto de 1.024 tokens del modelo Laya con el que se compara en la propia model card. Segun los datos publicados, sobre 1.280 elementos reales de 24K tokens acierta el 98,3% y la precision se mantiene plana entre 1K y 24K tokens (afirmacion preregistrada que consta como superada).

Es relevante ahora porque ofrece clasificacion y enrutado de decisiones con contexto largo en un paquete de 0,80 GB en 8 bits, ejecutable en un portatil Apple Silicon, con paridad declarada de 240 de 240 filas frente a la referencia FP32 en PyTorch. El repositorio concreto analizado registra 0 descargas y 0 me gusta en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (etiqueta declarada "qwen3.5"), modelo de decision/clasificacion |
| Parametros totales | 0,8B (segun denominacion del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 25.600 tokens de entrada por llamada |
| Tipos de cuantizacion | bf16 (1,50 GB, por defecto) y 8 bits afines con grupo de 64 (0,80 GB); en otro repositorio existe GGUF Q4_K_M de 0,53 GB |
| Idiomas soportados | en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi (19 idiomas declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en carpetas bf16/ y 8bit/ con config.json y tokenizer; runtime compartido jev_style_decision_mlx.py, readout_config.json, release_config.json y manifest.json con sha256 |
| Libreria | mlx |
| Tamano del repositorio | 2,3 GB |
| Conversion | mlx 0.32.2 y mlx-lm 0.31.3 |
| Modelo base | chaoliangUNSW/Jev-Style-0.8B-Decision-v3 |
| Fecha de publicacion | 2026-10-07 (creacion y ultima actualizacion identicas) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta "qwen3.5" y de su naturaleza de modelo de decision con calibracion (tags "decision-model", "jev-style", "system-one", "calibration"). Se trata de un modelo de 0,8B orientado a clasificar y emitir decisiones sobre texto, no de un generador conversacional generico, con lectura de hasta 25.600 tokens por llamada. El repositorio incluye un fichero readout_config.json con temperaturas ajustadas, lo que apunta a una etapa de calibracion del mecanismo de lectura de la decision.

En cuanto al entrenamiento, la model card remite al repositorio principal para los datos completos: indica que existen resultados, protocolos, datos de entrenamiento y licencias en la model card de chaoliangUNSW/Jev-Style-0.8B-Decision-v3, pero no reproduce el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Si se menciona el conjunto de paridad empleado para validar los formatos: 240 filas mixtas extraidas del pool de entrenamiento, con 22 categorias, en ingles y chino, usadas para comprobar el acuerdo entre precisiones y no la exactitud. La conversion a MLX aplica el ajuste de activaciones validado para cada build (float32 en bf16, nativo en 8 bits).

## Capacidades

- Toma de decisiones y clasificacion de texto: el ejemplo de uso de la API es `js.decide("I was charged twice.", {"billing": noul("This is about billing.")})`, es decir, asignar una entrada a una de las decisiones candidatas definidas por el usuario.
- Clasificacion de intenciones: evaluado en Banking77 (77 intenciones, nunca vistas en entrenamiento) con un 68,2% de acierto y en MASSIVE intent con 37 idiomas retenidos con un 65,5%.
- Clasificacion de temas en redes sociales: tweet_topic en modo zero-shot con un 75,5%.
- Contexto largo: lectura de documentos de hasta 25.600 tokens en una sola llamada, con exactitud plana declarada de 1K a 24K tokens y 98,3% de acierto en 1.280 elementos reales de 24K tokens.
- Multilingue: por delante del checkpoint Laya multilingual en 51 de 51 idiomas evaluados; 19 idiomas declarados en las etiquetas de metadatos.
- Decisiones tipadas: +2,6 puntos sobre el checkpoint typed de Laya en decisiones con tipos, entrenado con la misma particion.
- Integracion en agentes: el runtime jev-style expone una API compatible con systemone, un Playground, seis habilidades de agente (`npx skills add lawrence3699/jev-style`), un hook de guarda para Claude Code y herramientas MCP. Estas capacidades pertenecen al envoltorio de ejecucion, no al modelo en si.
- Sin modo thinking, vision ni audio declarados: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el modelo asigna cada ticket entrante a una categoria de negocio (facturacion, incidencias tecnicas, cancelaciones) ejecutandose localmente en 0,80 GB en 8 bits, sin enviar el contenido del cliente a un servicio externo.
- Deteccion de intenciones en asistentes conversacionales: con 25.600 tokens de entrada puede clasificar la intencion leyendo el historial completo de la conversacion en una sola llamada, en lugar de truncar a 1.024 tokens como hace Laya por defecto.
- Moderacion y triaje de contenido en varios idiomas: al cubrir 19 idiomas declarados y situarse por delante de Laya multilingual en 51 de 51 idiomas evaluados, sirve para clasificar entradas multilingues con un unico modelo en lugar de una cascada por idioma.
- Analisis de temas en redes sociales: uso directo en zero-shot sobre tweet_topic (75,5%) para agrupar publicaciones por tematica sin reentrenamiento.
- Guardas de agentes de codigo: el hook de guarda para Claude Code permite usar el modelo como filtro local que decide si una accion de un agente debe bloquearse o permitirse, con el coste de una llamada de 0,8B.
- Extraccion de campos en contratos o correos largos: con soporte de hasta 25.600 tokens y exactitud estable entre 1K y 24K tokens, se puede alimentar el documento completo y obtener decisiones de clasificacion sin troceado ni agregacion posterior.
- Clasificacion en el borde (on-device): al pesar 0,80 GB y ejecutarse con MLX en Apple Silicon, encaja en aplicaciones de escritorio o moviles que necesitan clasificar sin conectividad.

## Benchmarks y rendimiento

| Evaluacion | Jev-Style v3 0.8B | Mejor Laya oficial | Notas |
|---|---:|---:|---|
| Banking77, 77 intenciones (nunca entrenado) | 68,2% | 49,2% | Intervalos de confianza pareados al 95% excluyen el cero |
| MASSIVE intent, 37 idiomas retenidos | 65,5% | 36,1% | Intervalos de confianza pareados al 95% excluyen el cero |
| tweet_topic, zero-shot | 75,5% | 63,2% | Cifra de Laya en ingles, segun el estudio elcronos |
| JevBench v1.4.1, 231 elementos publicos, zero-shot | 64,1% | 58,4% | Puntuacion de Laya publicada en el tablero de JevBench; cae dentro del IC del 95% de v3, por lo que la ventaja es una estimacion puntual |
| Documentos reales de 24K tokens (1.280 elementos) | 98,3% correctos | no disponible | Exactitud plana declarada de 1K a 24K tokens (afirmacion preregistrada, superada) |
| Paridad de formato frente a FP32 en PyTorch | 240 de 240 filas; 6 de 6 prompts de ~16K y 25,6K tokens | no disponible | Fixture de paridad, mide acuerdo entre formatos y no exactitud |

Comparaciones adicionales declaradas: +2,6 puntos sobre el checkpoint typed de Laya en decisiones con tipos y por delante de Laya multilingual en 51 de 51 idiomas. No se aportan cifras desglosadas por idioma ni resultados de MMLU, HumanEval o GSM8K, que no serian aplicables a un modelo de clasificacion.

## Requisitos de hardware

- Build 8 bits (afines, grupo 64): 0,80 GB de pesos. Es la opcion recomendada para equipos con poca memoria.
- Build bf16: 1,50 GB de pesos, con activaciones en float32.
- GGUF Q4_K_M: 0,53 GB, el build mas pequeno de la serie, en repositorio aparte.
- Memoria total en ejecucion: no disponible; la model card solo publica el tamano de pesos, no el coste de la cache KV para entradas de 25.600 tokens.
- GPU compatibles: MLX esta disenado para Apple Silicon (serie M). No se declara soporte para A100, H100, RTX 4090 ni CUDA en esta informacion.
- Cabe en GPU de consumo: si, en el sentido de que esta pensado para ejecutarse en un portatil Apple Silicon; no se especifican modelos de GPU de escritorio.
- Despliegue: `pip install "jev-style[mlx]"` y `jev-style serve`; en Python, `JevStyle.from_pretrained(...)` con `precision="8bit"` o `"bf16"`. El runtime elige la carpeta y aplica el ajuste de activaciones validado. Para plataformas no Apple, el repo GGUF Q4_K_M permite llama.cpp u Ollama (no confirmado explicitamente en la informacion disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Banking77 | MASSIVE (37 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3 (MLX) | 0,8B | 25.600 tokens | 68,2% | 65,5% | apache-2.0 | Pesos MLX bf16 y 8 bits; GGUF Q4_K_M; demo en Spaces |
| Mejor checkpoint oficial de Laya | no disponible | 1.024 tokens por defecto (512 en el checkpoint ingles) | 49,2% | 36,1% | no disponible | Checkpoints multilingue, typed e ingles |
| Jev-Style-Qwen3.5-2B-Decision (v1/v2) | 2B | prompt menor que v3, 25x menor segun la model card | no disponible | no disponible | no disponible | GGUF (v1) y MLX bf16 (v2) |

Los porcentajes de Laya corresponden a reevaluaciones realizadas por los autores de Jev-Style sobre filas identicas y con las temperaturas oficiales de Laya. No se dispone de datos de otros clasificadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no debe emplearse como chatbot ni para generacion de texto libre; su salida es una eleccion entre decisiones candidatas proporcionadas por el usuario.
- Exactitud absoluta moderada en clasificacion de intenciones: 68,2% en Banking77 y 65,5% en MASSIVE indican que un tercio de los casos puede clasificarse de forma incorrecta; conviene disenar umbrales y fallbacks antes de usarlo en produccion.
- La ventaja sobre Laya en JevBench v1.4.1 (64,1% frente a 58,4%) es una estimacion puntual cuyo intervalo de confianza al 95% incluye la puntuacion de Laya, por lo que no puede considerarse una superioridad confirmada.
- Datos de entrenamiento no reproducidos en esta model card: composicion del dataset, numero de tokens y uso de RLHF/DPO remiten al repositorio principal, lo que dificulta auditar sesgos.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: en un clasificador la manifestacion tipica es una decision confiada pero incorrecta, especialmente en categorias poco representadas o dominios alejados del entrenamiento.
- Rendimiento por idioma: se declara ventaja sobre Laya multilingual en 51 de 51 idiomas, pero no se publican metricas desglosadas por idioma en la informacion disponible.
- Contexto: aunque admite 25.600 tokens, no se publica el consumo de memoria de la cache KV a esa longitud, lo que puede limitar su uso real en equipos con poca RAM unificada.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el modelo base es chaoliangUNSW/Jev-Style-0.8B-Decision-v3 y su model card completa debe consultarse para condiciones adicionales y atribucion.
- Repositorio con 0 descargas y 0 me gusta: la publicacion analizada no cuenta con validacion de la comunidad, y la model card adjunta apunta a los repositorios de chaoliangUNSW, no a este.
- Consistencia entre precisiones: la paridad de 240 de 240 filas se midio sobre un fixture mixto de entrenamiento en ingles y chino; no se declara paridad equivalente en los otros 17 idiomas.

## Enlaces

- Repositorio analizado: https://huggingface.co/gahabeen/Jev-Style-0.8B-Decision-v3-MLX
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Builds MLX principales: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX
- Build GGUF Q4_K_M (0,53 GB): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Serie v1 (2B, GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Serie v2 (2B, MLX bf16): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Coleccion de builds y demos v3: https://huggingface.co/collections/chaoliangUNSW/jev-style-08b-decision-v3-6ab58abb90ae4b7b55578b3e
- Demo en el navegador: https://huggingface.co/spaces/chaoliangUNSW/jev-style-v3
- Repositorio de codigo: https://github.com/lawrence3699/jev-style
- Sitio web del proyecto: https://jevstyle.com/#v3
