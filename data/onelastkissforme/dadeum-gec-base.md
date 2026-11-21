# onelastkissforme/dadeum-gec-base

## Resumen

dadeum-gec-base es un modelo de corrección gramatical, ortográfica y de espaciado para coreano, desarrollado por el usuario onelastkissforme como componente del proyecto dadeum, un corrector que se ejecuta localmente en el ordenador del usuario (concretamente en macOS). El modelo parte de KoBART (gogamza/kobart-base-v2) y se ha afinado para reescribir únicamente los fragmentos erróneos de una frase, dejando intacto el resto del texto. Su enfoque es deliberadamente conservador: prioriza la precisión sobre la exhaustividad y aplica una compuerta de decisión basada en el margen de log-verosimilitud para decidir si acepta cada cambio propuesto.

Técnicamente es un transformer encoder-decoder de tipo BART con 6 capas en el encoder y 6 en el decoder, anchura 768 y 123,9 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños aptos para inferencia en CPU. El contexto de trabajo está limitado a una frase de hasta 128 tokens; los textos más largos se segmentan por finales de frase. Se distribuye bajo licencia CC BY-SA 4.0, con el script de corrección asociado bajo licencia MIT.

Su relevancia actual reside en que ofrece una alternativa abierta y ligera a los correctores comerciales o basados en LLM, con la particularidad de que ningún par de entrenamiento fue anotado por un proveedor de IA. Está pensado para integrarse en aplicaciones de escritorio que necesitan corrección ortográfica y gramatical en coreano sin depender de servicios en la nube, a un coste de latencia de unos 120 ms por frase en CPU (Apple M4 Pro, 4 hilos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder), 6 capas encoder + 6 capas decoder, anchura 768 |
| Parametros totales | 123.889.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens por frase; textos largos se segmentan por finales de frase |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | CC BY-SA 4.0 (script de corrección MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BART afinado desde KoBART (gogamza/kobart-base-v2), con 6 capas de encoder y 6 de decoder, anchura 768 y 123,9M de parámetros. La tarea es de text2text generation: recibe una frase y devuelve una versión corregida. La innovación principal no está en la arquitectura sino en el pipeline de decisión: cada cambio propuesto se evalúa mediante el margen de log-verosimilitud del propio modelo y solo se conserva si supera el umbral definido en `gating.json`. Además, se aplican guardas que descartan cambios que afecten a caracteres no Hangul o no ASCII, que añadan o eliminen dos o más caracteres, que modifiquen números, o que introduzcan saltos de tres o más jamo hacia una palabra ausente de la lista abierta `known_words.bin`. El script `dadeum_correct.py` implementa todo este proceso; una llamada directa a `generate()` omite la compuerta y las guardas.

Los datos de entrenamiento provienen exclusivamente de texto y objetivos con licencia abierta, sin anotación por parte de proveedores de IA. Se distinguen dos fuentes: correcciones generadas por el motor de reglas de dadeum (con las partes ajustadas a datos anotados por IA desactivadas) sobre nsmc (CC0), comentarios no etiquetados de kocohub, Wikipedia y Wikinews en coreano (CC BY-SA 4.0) y 정책브리핑 (KOGL Type 1); y correcciones de editores de Wikipedia coreana extraídas del historial de páginas (CC BY-SA 4.0), filtradas para excluir frases de evaluación, intercambios de contenido y cambios de script extranjero o de números. Los pasos de entrenamiento indicados son clean_full (legacy_clean:60, wiki_edits:7). No se menciona uso de RLHF ni DPO.

## Capacidades

- Corrección ortográfica en coreano: detecta y corrige errores de escritura en hangul.
- Corrección de espaciado: ajusta los espacios entre palabras según las convenciones del coreano.
- Corrección gramatical: corrige partículas y errores gramaticales menores.
- Edición mínima: reescribe solo los fragmentos erróneos y preserva el resto de la frase.
- Salida de ediciones estructuradas: el método `edits()` devuelve una lista de tuplas (inicio, fin, reemplazo).
- Filtrado por compuerta de confianza: cada cambio se acepta o rechaza según el margen de log-verosimilitud.
- Guardas de seguridad: no altera caracteres no Hangul ni no ASCII, no cambia números, no añade ni elimina dos o más caracteres, y no introduce saltos de tres o más jamo hacia palabras desconocidas.
- Ejecución en CPU: inferencia local sin GPU, con latencia de 120 ms mediana por frase en Apple M4 Pro (4 hilos).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente coreano.

## Casos de uso

- Corrección integrada en aplicaciones de escritorio para macOS: el modelo se ejecuta localmente dentro de la app dadeum, corrigiendo texto mientras el usuario escribe sin enviar datos a la nube, gracias a su tamaño de 123,9M de parámetros y su latencia de 120 ms en CPU.
- Revisión de correos electrónicos profesionales: el modelo apenas modifica frases ya correctas (0 frases cambiadas en 27 frases de correo laboral correcto), por lo que es adecuado para revisar comunicaciones formales sin introducir cambios no deseados.
- Pretratamiento de textos para pipelines de NLP: al corregir ortografía y espaciado en coreano antes de tareas downstream (análisis de sentimiento, clasificación, extracción de entidades), se reducen errores debidos a variaciones ortográficas.
- Corrección de comentarios y reseñas de usuarios: el modelo está entrenado con comentarios de kocohub y datos de dominios sellados (reseñas, comentarios, política, solicitudes), lo que lo hace útil para moderación o mejora de contenido generado por usuarios.
- Edición de artículos en wikis y plataformas colaborativas: las correcciones de editores de Wikipedia coreana forman parte del entrenamiento, por lo que el modelo puede asistir en la revisión ortográfica y de espaciado de textos enciclopédicos.
- Herramienta de apoyo para hablantes nativos: dado que está diseñado para escritura nativa y corrige mejor ortografía, espaciado y partículas que elección léxica o estilo, encaja como asistente de revisión para hablantes nativos que quieren pulir sus textos.
- Integración en entornos con recursos limitados: al caber en CPU y ocupar 0,5 GB en disco, puede desplegarse en dispositivos sin GPU o en servidores modestos para corrección por lotes de frases.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden F0.5 sobre ediciones de caracteres (ediciones contiguas fusionadas), con un gold anotado por IA (Claude) bajo una guía de anotación propia. La tabla comparativa es del autor, no un ranking de terceros.

| Medida | Valor |
|---|---|
| Mitad ciega de validación (1.196 frases), F0.5 (P / R) | .890 (.964 / .682); motor de reglas dadeum: .899 (.946 / .750) |
| Desarrollo, 300 frases, F0.5 | .918; motor de reglas: .950 |
| Test en dominio, 350 frases, F0.5 | .904; motor de reglas: .927 |
| Dominios sellados (reseñas, comentarios, política, solicitudes), 870 frases, F0.5 | .820; motor de reglas: .863 |
| Dominios de confirmación, 600 frases, F0.5 | .803; motor de reglas: .831 |
| Noticias, negocios y comentarios (anotador único), 799 frases, F0.5 | .788; motor de reglas: .820 |
| Kor-Lang8 reconstruido (aprendices), 2.000 frases, F0.5 | .089; motor de reglas: .088 |
| Correo laboral correcto (27 frases y el correo completo), frases cambiadas | 0 |
| Frases de Wikipedia limpias (19.759), frases cambiadas | 694 (602 solo espaciado); motor de reglas: 424 |
| Latencia CPU por frase, Apple M4 Pro, 4 hilos | 120 ms mediana, 325 ms p95 |

Comparativa con otros correctores coreanos (mismo conjunto de frases y scorer, F0.5):

| Sistema | Dominios sellados (870) | Dominios de confirmación (600) | Kor-Lang8 (2.000) |
|---|---|---|---|
| dadeum-gec-base (este modelo) | .820 | .803 | .089 |
| Motor de reglas dadeum (la app) | .863 | .831 | .088 |
| Claude Sonnet 5.5 con guía de anotación | .895 | .887 | no ejecutado |
| Qwen3-8B | .548 | .562 | .127 |
| KoGrammar distil (theSOL1) | .481 | .435 | .107 |
| KoGrammar base (theSOL1) | .476 | .439 | .104 |
| ET5 typos corrector (j5ng) | .408 | .347 | .102 |
| KoBART gec_kr (Soyoung97) | .216 | .187 | .266 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 123,9M de parámetros, en fp32 ocupa aproximadamente 0,5 GB de pesos; en fp16 unos 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. En caso de usar GPU, cualquier modelo con al menos 1-2 GB de VRAM es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU.
- Opciones de despliegue: transformers (librería indicada en la model card); el autor proporciona `dadeum_correct.py` para inferencia con compuerta y guardas. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 120 ms mediana y 325 ms p95 por frase en CPU Apple M4 Pro con 4 hilos. No se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F0.5 dominios sellados | F0.5 Kor-Lang8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dadeum-gec-base | 123,9M | 128 tokens/frase | .820 | .089 | CC BY-SA 4.0 | Hugging Face |
| KoBART gec_kr (Soyoung97) | no disponible | no disponible | .216 | .266 | no disponible | Hugging Face |
| KoGrammar base (theSOL1) | no disponible | no disponible | .476 | .104 | no disponible | Hugging Face |
| KoGrammar distil (theSOL1) | no disponible | no disponible | .481 | .107 | no disponible | Hugging Face |
| ET5 typos corrector (j5ng) | no disponible | no disponible | .408 | .102 | no disponible | Hugging Face |

La comparación se basa en la tabla publicada por el autor del modelo, que emplea su propio gold y su propio scorer; no es un ranking de terceros. En escritura de aprendices (Kor-Lang8), KoBART gec_kr obtiene un F0.5 muy superior (.266 frente a .089), aunque en dominios sellados y de confirmación este modelo lo supera ampliamente.

## Limitaciones y advertencias

- El benchmark es propio del autor y favorece a este modelo: el gold fue escrito por Claude bajo su guía de anotación y prima las ediciones mínimas, por lo que los correctores que reescriben más obtienen puntuaciones bajas. Ningún humano revisó ese gold.
- Aprende del motor de reglas de dadeum y no supera a dicho motor, que es el que usa la app dadeum. Su valor diferencial es la licencia abierta y un único archivo ejecutable en CPU.
- Está diseñado para escritura nativa. En escritura de aprendices corregida por personas (Kor-Lang8), donde las referencias reescriben frases completas, apenas cambia nada y KoBART gec_kr rinde mucho mejor.
- Comparte los puntos ciegos del motor de reglas: corrige ortografía, espaciado y partículas mucho mejor que la elección léxica o el estilo.
- Procesa una frase a la vez, hasta 128 tokens; los textos más largos se dividen por finales de frase, lo que puede perder coherencia entre frases.
- Riesgo de alucinación: no se menciona explícitamente, pero al ser un modelo generativo podría proponer cambios no deseados; las guardas y la compuerta mitigan este riesgo, aunque no lo eliminan.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Restricciones de licencia: CC BY-SA 4.0 implica que las obras derivadas deben compartirse bajo la misma licencia y requiere atribución (ver NOTICE). El script `dadeum_correct.py` es MIT.
- Solo soporta coreano; no es multilingüe.
- El pipeline declarado es text-generation, aunque la tarea real es text2text-generation (corrección); conviene tenerlo en cuenta al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onelastkissforme/dadeum-gec-base
- Repositorio del proyecto dadeum: https://github.com/zmflm0110/dadeum
- Modelo base KoBART: https://huggingface.co/gogamza/kobart-base-v2
