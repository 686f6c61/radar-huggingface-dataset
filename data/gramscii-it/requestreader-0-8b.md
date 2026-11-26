# Gramscii-IT/RequestReader-0.8B

## Resumen

RequestReader-0.8B es un adaptador LoRA sobre Qwen3.5-0.8B desarrollado por Gramscii-IT, orientado a una tarea muy concreta dentro de sistemas conversacionales: leer una petición del usuario y descomponerla en doce campos estructurados antes de que el enrutador decida qué herramienta ejecutar. El modelo no elige herramientas; su función es interpretar la superficie del mensaje (a qué se refiere, qué acción pide, sobre qué elemento de un turno anterior opera, si encadena peticiones, formato, longitud, fuentes, cálculos, etc.) y devolver esas doce líneas en formato `clave: valor`.

El adaptador se apoya en el modelo base Qwen3.5-0.8B, del que hereda arquitectura y licencia Apache-2.0. El repositorio publica únicamente el adaptador en formato GGUF F16 (108.252.256 bytes), pensado para cargarse sobre el base cuantizado con `llama-server` mediante `--lora`. No es un modelo autónomo: requiere el base y un host que valide cada línea contra el mensaje y el historial.

Su relevancia actual radica en el enfoque de destilación de lecturas de profesores (GLM 5.2 y Qwen3.8-27B) sobre un modelo pequeño, lo que permite incorporar interpretación de intención conversacional multi-turno en despliegues de bajos recursos. El entrenamiento se realizó sobre 9.743 filas (mitad italiano, mitad inglés) y se midió sobre 450 mensajes no vistos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3.5-0.8B, solo el modelo de lenguaje) |
| Parámetros totales | 54.113.280 (adaptador; el base Qwen3.5-0.8B es aparte) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `-c 4096`) |
| Tipos de cuantización | Adaptador publicado en F16 GGUF; el base admite las cuantizaciones de llama.cpp (ejemplo con Q8_0) |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA F16, `request-reader-0.8b-20261126b-lora-f16.gguf`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 16, dropout 0, aplicado sobre todas las capas lineales del modelo de lenguaje del base (186 módulos). El entrenamiento se hizo con Unsloth en bf16, con 8-bit AdamW, learning rate 2×10⁻⁴ lineal con 10% de warm-up y weight decay 0.01. Se realizó una única pasada de 609 actualizaciones con 16 ejemplos por paso (2 × 8 acumulados), y la release publicada es la media de los checkpoints en las actualizaciones 420, 480, 540, 600 y 609. La pérdida se calculó únicamente sobre las doce líneas de salida. El entrenamiento se ejecutó en una NVIDIA A100 de 64 GB del supercomputador Leonardo (Bolonia, CINECA).

Los datos de entrenamiento son 9.743 filas, aproximadamente mitad italiano y mitad inglés, compuestas por las lecturas en las que coincidieron dos profesores (GLM 5.2 y Qwen3.8-27B, o el 27B dos veces) sobre conversaciones diseñadas para el trabajo del chat: datos abiertos, licitaciones y subvenciones, presentaciones, dashboards, páginas, textos, fechas, cálculos, fuentes, seguimientos y modificaciones de turnos anteriores, incluyendo mensajes ruidosos y ambiguos. Se incluye una familia de 856 filas de cadenas y de mensajes que solo lo parecen, generadas por Qwen3.8-27B y leídas dos veces por él. Se excluyeron los mensajes cercanos a las preguntas de los tests que evalúan el chat y se reservó 1 de cada 25 personas para la medición.

## Capacidades

- Lectura de peticiones conversacionales en doce campos: `subject`, `action`, `refers`, `element`, `chain`, `format`, `length`, `creative`, `time`, `unclear`, `sources`, `compute`.
- Detección de seguimientos y revisiones sobre turnos anteriores («e per la Puglia?», «rehaz la segunda diapositiva en rojo»).
- Identificación del elemento referido dentro de un turno: diapositiva por posición, mazo completo, filas, texto, imagen, gráfico.
- Detección de encadenamiento entre peticiones (una petición opera sobre lo que encuentra otra).
- Clasificación de formato y longitud de texto (post o artículo, breve o detallado) y de carácter creativo.
- Distinción de fechas como metadatos de búsqueda o como contenido del mensaje.
- Marcado de ambigüedad (`unclear`) cuando dos lecturas encajan igual.
- Identificación de fuentes nombradas (web, datos abiertos, documentos) y de peticiones de cálculo sobre cifras dadas.
- Multilingüe limitado a italiano e inglés.
- No soporta tool calling ni selección de herramientas: esa decisión corresponde al enrutador del host.

## Casos de uso

- Enrutamiento de intención en asistentes conversacionales multi-turno: el adaptador transforma el mensaje en campos estructurados que el enrutador usa para decidir qué herramienta invocar, resolviendo referencias como «y para Puglia?» o «rehaz la segunda diapositiva» sin que el enrutador tenga que interpretar lenguaje natural.
- Generación de presentaciones asistida: al identificar `element` (diapositiva por posición, mazo, gráfico) y `action` (nueva petición, revisión, adición o eliminación), permite que el generador de diapositivas aplique cambios quirúrgicos sobre el turno anterior en lugar de regenerar el mazo completo.
- Consulta de datos abiertos y licitaciones: `sources` y `compute` indican si el mensaje pide búsqueda web, datos abiertos o cálculo sobre cifras dadas, lo que permite encaminar la petición al conector adecuado y activar el motor de cálculo solo cuando procede.
- Detección de encadenamiento en pipelines de agentes: `chain` distingue peticiones que operan sobre el resultado de otra («qué región tiene más empresas, luego muéstrame su población»), habilitando la planificación en varios pasos solo cuando el mensaje realmente lo exige.
- Filtrado de ambigüedad antes de ejecutar acciones costosas: `unclear` marca mensajes con dos lecturas igualmente válidas, lo que permite al host solicitar aclaración al usuario en lugar de ejecutar una acción potencialmente incorrecta.
- Clasificación de peticiones de contenido textual: `format`, `length` y `creative` permiten decidir si se genera un post breve o un artículo detallado, y si se activa un modo creativo, sin necesidad de que el generador principal procese esa decisión.
- Normalización de fechas en búsquedas documentales: `time` distingue si una fecha citada restringe la fecha de escritura de las páginas a buscar o forma parte del contenido que se pide, lo que evita filtros de fecha erróneos en motores de búsqueda documental.
- Despliegue en entornos de bajos recursos: al ser un adaptador de 108 MB sobre un base de 0,8B, puede ejecutarse en CPU o GPU modesta con llama.cpp, integrándose como paso previo de bajo coste en arquitecturas con modelos generativos mayores.

## Benchmarks y rendimiento

Medición sobre 450 mensajes de personas no vistas en entrenamiento, comparando las doce líneas del adaptador con las de los profesores:

| Línea | Coincidencia con los profesores |
|---|---|
| `subject`, palabra por palabra | 251 / 450 |
| `action` | 426 / 450 |
| `refers` | 422 / 450 |
| `element` | 420 / 450 |
| `chain` | 448 / 450 |
| `format` | 445 / 450 |
| `length` | 444 / 450 |
| `creative` | 444 / 450 |
| `time` | 431 / 450 |
| `unclear` | 448 / 450 |
| `sources` | 432 / 450 |
| `compute` | 445 / 450 |

Resultados adicionales reportados: las 450 respuestas fueron doce líneas legibles y 198 de 450 fueron correctas en todas las líneas. De los 7 mensajes cuyas peticiones forman cadena, detecta 6 como cadena; de los 443 que no la forman, detecta 1 como cadena.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 108.252.256 bytes (F16 GGUF) y se carga junto al base Qwen3.5-0.8B; el consumo total depende de la cuantización del base.
- Con el base en Q8_0 (ejemplo de la model card) el conjunto cabe holgadamente en GPU consumer; con cuantizaciones menores (Q4, Q5) el requisito de VRAM baja aún más.
- El entrenamiento se realizó en una NVIDIA A100 de 64 GB, pero la inferencia no requiere ese hardware.
- Despliegue recomendado: `llama-server` con `-m .gguf --lora <adaptador>.gguf`, `-ngl 99` y `-c 4096`, exponiendo `POST /v1/completions` con temperatura 0 y `stop: ["<|im_end|>"]`.
- El adaptador está pensado para cargarse sobre el base de SemanticRepair-0.8B y ToolChooser-0.8B; cuando el base lleva varios adaptadores, cada petición escala este a plena magnitud y los otros a cero.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RequestReader-0.8B | 54.113.280 (adaptador LoRA) | no disponible | Lectura de peticiones en doce campos | Apache-2.0 | Hugging Face (GGUF LoRA) |
| ToolChooser-0.8B (Gramscii-IT) | no disponible | no disponible | Selección de herramienta | no disponible | Hugging Face |
| SemanticRepair-0.8B (Gramscii-IT) | no disponible | no disponible | Reparación semántica | no disponible | Hugging Face |
| Qwen3.5-0.8B (modelo base) | no disponible | no disponible | Generación de texto | Apache-2.0 | Hugging Face |

Los tres adaptadores de Gramscii-IT comparten base Qwen3.5-0.8B y están diseñados para convivir en el mismo despliegue con escalado selectivo por petición. No se dispone de datos de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere el base Qwen3.5-0.8B y un host que valide cada línea contra el mensaje y el historial; las líneas de `subject` o `refers` que no se sostienen se descartan y el mensaje se ejecuta como si el lector no hubiera nombrado nada.
- Solo soporta italiano e inglés; no hay soporte declarado de castellano ni de otros idiomas.
- El rendimiento en `subject` palabra por palabra es bajo (251/450), por lo que no debe usarse como extractor literal de temas.
- La detección de cadenas es conservadora: de 443 mensajes sin cadena, 1 se clasifica erróneamente como cadena; de 7 con cadena, 1 no se detecta.
- Solo 198 de 450 mensajes fueron correctos en las doce líneas simultáneamente, lo que implica que en producción es frecuente que alguna línea sea incorrecta.
- El modelo no elige herramientas ni ejecuta acciones; cualquier expectativa de comportamiento agéntico debe implementarse en el host.
- Riesgo de alucinación en los campos de texto libre (`subject`), aunque el host mitiga descartando referencias no presentes en el historial.
- Sesgos: no se documentan sesgos específicos en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del base Qwen3.5-0.8B y el cumplimiento de sus términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gramscii-IT/RequestReader-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Adaptador relacionado SemanticRepair-0.8B: https://huggingface.co/Gramscii-IT/SemanticRepair-0.8B
- Adaptador relacionado ToolChooser-0.8B: https://huggingface.co/Gramscii-IT/ToolChooser-0.8B
- Unsloth (herramienta de entrenamiento): https://unsloth.ai
