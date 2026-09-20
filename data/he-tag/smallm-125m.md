# He-Tag/smallm-125m

## Resumen

smallm-125m es un modelo de lenguaje conversacional bilingue (ingles y aleman) desarrollado por el usuario He-Tag y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer decoder-only de 135.266.334 parametros (12 capas, 12 cabezas, anchura 768, vocabulario de 32.768 tokens) entrenado integramente desde cero en dos GPU Kaggle T4 durante 28 horas, sobre aproximadamente 3.5 mil millones de tokens (60 % ingles, 40 % aleman). Su ventana de contexto es de 1024 tokens, compartidos entre prompt y respuesta.

El interes del modelo no esta en su rendimiento bruto, sino en su proceso: es un ejemplo reproducible de entrenamiento completo (preentrenamiento + ajuste por instrucciones) con coste cero de computo y codigo publico. Sigue las recetas de modded-nanogpt (RMSNorm sin ganancia aprendible, RoPE, QK-norm, MLP con ReLU², value residuals, conexiones residuales en U-net entre las mitades de la red y softcap tanh sobre los logits), lo que lo convierte en una referencia didactica para quienes quieren entender que se puede y que no se puede conseguir con 3.5B tokens.

Ahora mismo es relevante como banco de pruebas de bajo coste: cabe en cualquier GPU de consumo, corre en CPU y en Apple silicon (unos 90 tokens/s en MPS), y documenta con honestidad sus fallos (aritmetica, traduccion, conteo, hechos poco frecuentes). No es un modelo para produccion con requisitos factuales, pero si una base util para experimentacion, ajuste fino y docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con implementacion personalizada (estilo modded-nanogpt); requiere `trust_remote_code=True` |
| Parametros totales | 135.266.334 (incluye embeddings; el autor lo etiqueta como "125m") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (prompt + respuesta) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) y aleman (de) |
| Licencia | Apache 2.0 (pesos y codigo); ver advertencias sobre licencias de los datasets de ajuste |
| Formato de pesos | safetensors (repo de 0.3 GB), libreria `transformers` con `custom_code` |
| Capas / cabezas / anchura | 12 / 12 / 768 |
| Vocabulario | 32.768 tokens (BPE a nivel de byte, entrenado sobre la mezcla de entrenamiento) |
| Precision de entrenamiento | fp16 con gradient scaler (las T4 no soportan bf16 de forma nativa) |
| Configuracion de generacion por defecto | temperature 0.3, top-p 0.9, repetition_penalty 1.15, no_repeat_ngram_size 4 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas con anchura 768 y 12 cabezas de atencion, con embedding y proyeccion de salida atados al vocabulario de 32.768 tokens. Incorpora un conjunto de optimizaciones tomadas de modded-nanogpt: RMSNorm sin ganancia aprendible, ausencia de sesgos en las capas lineales, embeddings rotatorios (RoPE), QK-norm, MLP con activacion ReLU², value-residual learning, conexiones residuales tipo U-net entre la primera y la segunda mitad de la red, un atajo de embedding por bloque, proyecciones de salida inicializadas a cero y un softcap tanh sobre los logits. No es una arquitectura integrada en `transformers`, de ahi que tanto el modelo como el tokenizador exijan `trust_remote_code=True` y que el widget de inferencia del Hub no funcione.

El entrenamiento tuvo dos fases. La primera fue un preentrenamiento sobre 3.49B tokens extraidos de FineWeb-EDU, del subconjunto cosmopedia-v2 de SmolLM-corpus y del subconjunto aleman (deu_Latn) de FineWeb2-HQ. La segunda fue un ajuste por instrucciones sobre 162M tokens de conversaciones en ingles y aleman procedentes de smol-smoltalk, smoltalk2, alpaca-gpt4_de, oasst_de y germanrag. Todo el proceso se ejecuto en dos GPU Kaggle T4 durante 28 horas, sin coste de computo, y el codigo esta publicado en GitHub. No se documenta uso de RLHF ni de DPO; el ajuste es de tipo supervisado sobre conversaciones.

## Capacidades

- Generacion de texto corto y respuestas factuales comunes, con finalizacion limpia: 17 de 22 respuestas de la evaluacion interna terminan solas.
- Explicaciones de temas comunes: el ejemplo documentado de la fotosintesis menciona cloroplastos, clorofila y oxigeno como subproducto.
- Generacion de formatos: listas numeradas, esqueletos de correo electronico y resumenes.
- Conversacion multiturno limitada: mantiene referencias a turnos anteriores durante dos o tres rondas.
- Bilinguismo real ingles-aleman, con tokenizador entrenado sobre texto aleman autentico (incluye dieresis).
- Modo conversacional mediante plantilla de chat (`apply_chat_template`).
- Ejecucion en CPU y en Apple silicon via MPS (aproximadamente 90 tokens/s en MPS).
- No soporta tool calling ni function calling, no tiene capacidades de agente, ni vision, ni audio, ni modo de razonamiento explicito. No se documenta ningun tipo de capacidad multimodal.

## Casos de uso

- Prototipado y docencia sobre entrenamiento de LLM: al haberse entrenado desde cero en hardware gratuito y con codigo abierto, sirve para reproducir el pipeline completo y medir el efecto de la escala de datos.
- Punto de partida para ajuste fino en dominios concretos: al ser un modelo de 135M y Apache 2.0, se puede reentrenar en una unica GPU de consumo para vocabularios o estilos especificos de un nicho aleman o ingles.
- Generacion de texto corto en aleman para pruebas de producto: respuestas de una o dos frases y esqueletos de correo, siempre con revision humana.
- Demostraciones educativas de limitaciones de los LLM: sus fallos documentados en aritmetica, traduccion y conteo lo convierten en un caso practico para explicar alucinacion y limites de escala.
- Evaluacion comparativa de tecnicas de decodificacion: la propia model card documenta que el temperature 0.3 evita invenciones que aparecen a 0.7, lo que lo hace util para experimentar con parametros de muestreo.
- Generacion de resumenes y listas de baja criticidad (notas internas, borradores) en ingles o aleman, donde el coste de un error es bajo y se puede filtrar manualmente.
- Inferencia en el borde o en entornos sin GPU: al ocupar unos cientos de MB, puede ejecutarse en CPU o en portatiles Apple para demos sin conexion.
- Benchmark de infraestructura: medir latencia y throughput en distintos backends y precisiones con un modelo de 135M antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos de evaluacion que aporta el autor son los siguientes:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Bits por caracter (aleman) | 0.817 | Texto escrito a mano, no presente en ningun corpus |
| Bits por caracter (ingles) | 0.988 | Texto escrito a mano, no presente en ningun corpus |
| Respuestas que terminan solas | 17 de 22 | Greedy, sin penalizacion de repeticion, 22 prompts |
| Throughput en Apple silicon | ~90 tokens/s | Ejecucion via MPS |
| Tokens de preentrenamiento | 3.49B | 60 % ingles, 40 % aleman |
| Tokens de ajuste por instrucciones | 162M | Conversaciones en ingles y aleman |

No hay comparacion con otros modelos publicada por el autor. Cualquier cifra de MMLU o similares que se cite para este modelo no procede de la informacion disponible.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 270 MB solo para pesos, mas activaciones y cache KV; en la practica menos de 1 GB para contextos de 1024 tokens.
- VRAM en int8: aproximadamente 135 MB de pesos.
- VRAM en 4 bits: aproximadamente 70 MB de pesos (requiere cuantizacion propia, no hay versiones oficiales publicadas).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660 o inferiores con suficiente memoria. Tambien corre en CPU y en Apple silicon via MPS (~90 tokens/s).
- GPU de datacenter (A100, H100) no son necesarias; solo tendrian sentido para entrenamiento o ajuste fino a gran escala.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada. Al ser una arquitectura personalizada no integrada en `transformers`, no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI sin una conversion previa del codigo y de los pesos, conversion que no se documenta en la informacion disponible.
- Latencia y throughput: el unico dato publicado es ~90 tokens/s en MPS. No hay cifras de latencia en GPU ni de throughput en CPU.
- Entrenamiento: el autor lo completo en 2 GPU Kaggle T4 (16 GB cada una) en 28 horas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| He-Tag/smallm-125m | 135,3M | 1024 | en, de | Apache 2.0 | Arquitectura custom, requiere `trust_remote_code` |
| GPT-2 (OpenAI) | 124M | 1024 | en | Licencia MIT modificada | Referencia historica; no es conversacional |
| Pythia-160M (EleutherAI) | 160M | 2048 | en | Apache 2.0 | Solo ingles; pensado para investigacion |
| SmolLM2-135M (HuggingFaceTB) | 135M | 2048 | en (principalmente) | Apache 2.0 | Entrenado con varios cientos de miles de millones de tokens |

Los datos de los modelos alternativos proceden de conocimiento general y no han podido verificarse en la busqueda web realizada, que no devolvio resultados relevantes sobre este modelo ni sobre sus comparables. No hay datos publicados que permitan comparar rendimiento en benchmarks entre smallm-125m y estas alternativas. La diferencia mas relevante y verificable es la escala de datos de entrenamiento: el autor indica que modelos comparables de este tamano ven varios cientos de miles de millones de tokens, frente a los 3.5B de smallm-125m.

## Limitaciones y advertencias

- La aritmetica falla de forma sistematica: a "3 manzanas mas 2" responde "3 × 2 = 6".
- No sabe traducir: ante una peticion de traduccion de una frase alemana, devuelve la misma frase en aleman.
- Falla al seguir instrucciones de conteo: "cuenta del 1 al 10" deriva en un texto sobre el numero 1.
- Los hechos colapsan fuera de los mas comunes: acierta Viena, Berlin o Shakespeare, pero responde que el mayor oceano es la Gran Barrera de Coral.
- Alucina con seguridad en lugar de declinar responder; el propio autor lo advierte de forma explicita.
- Las respuestas largas se desvian del objetivo: al pedir un correo educado de cancelacion puede escribir una aceptacion entusiasta.
- Los numeros en respuestas multiturno suelen ser incorrectos.
- Sensibilidad a la ortografia alemana: "Oesterreich" se interpreta como "Osteria" y responde Paris, mientras que "Österreich" se responde correctamente con Viena.
- La configuracion por defecto (temperature 0.3, top-p 0.9, repetition_penalty 1.15, no_repeat_ngram_size 4) es necesaria: a temperature 0.7 el modelo inventa hechos que acierta a 0.3, y sin bloqueo de n-gramas entra en bucles.
- Restricciones de licencia: los pesos son Apache 2.0, pero el ajuste por instrucciones uso `mayflowergmbh/alpaca-gpt4_de`, derivado de alpaca-gpt4 (CC BY-NC 4.0), es decir, con clausula de no uso comercial. El dataset smoltalk2 no declara licencia. Esto introduce incertidumbre legal para un uso comercial, a pesar de la licencia Apache 2.0 de los pesos.
- El modelo card original esta truncado en la seccion de procedencia de datos ("Two things for anyo..."), por lo que puede haber condiciones adicionales no recogidas aqui.
- No es apto para busqueda factual no verificada, traduccion, aritmetica ni para decisiones con consecuencias legales, medicas o financieras.
- Al usar una arquitectura personalizada, el codigo remoto debe auditarse antes de cargarlo (`trust_remote_code=True`), ya que el Hub no ejecuta ni valida ese codigo en el widget de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/He-Tag/smallm-125m
- Codigo de entrenamiento: https://github.com/He-Tag/smallm
- Receta base de arquitectura (modded-nanogpt): https://github.com/KellerJordan/modded-nanogpt
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu (ODC-BY 1.0)
- Dataset de preentrenamiento (cosmopedia-v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus (ODC-BY 1.0)
- Dataset de preentrenamiento (deu_Latn): https://huggingface.co/datasets/epfml/FineWeb2-HQ (ODC-BY 1.0)
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk (Apache 2.0)
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2 (sin licencia declarada)
- Dataset de ajuste: https://huggingface.co/datasets/mayflowergmbh/alpaca-gpt4_de (derivado de CC BY-NC 4.0)
- Dataset de ajuste: https://huggingface.co/datasets/mayflowergmbh/oasst_de (derivado de OASST1, Apache 2.0)
- Dataset de ajuste: https://huggingface.co/datasets/DiscoResearch/germanrag (CC BY 4.0)

Nota: la busqueda web realizada para esta ficha no devolvio ningun resultado relevante sobre el modelo He-Tag/smallm-125m; los unicos resultados obtenidos fueron definiciones lexicograficas en frances de la interjeccion "he", sin relacion con el modelo.
