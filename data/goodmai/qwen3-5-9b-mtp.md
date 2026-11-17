# goodmai/Qwen3.5-9B-MTP

## Resumen

`goodmai/Qwen3.5-9B-MTP` no es un modelo completo, sino un artefacto auxiliar: el cabezal de borrador (draft head) de predicción multi-token (MTP) extraído literalmente del checkpoint oficial `Qwen/Qwen3.5-9B` y empaquetado en un único fichero safetensors de aproximadamente 464 MiB (0,5 GB de repositorio). Lo publica el usuario goodmai, a partir del trabajo previo de guru87, para resolver un fallo concreto: la variante cuantizada `z-lab/Qwen3.5-9B-PARO` declara `mtp_num_hidden_layers: 1` en su configuración pero no incluye ningún tensor `mtp.*`, de modo que vLLM inicializa el módulo de borrador con pesos aleatorios y la decodificación especulativa pasa a ser coste puro sin beneficio.

El propósito es, por tanto, habilitar la decodificación especulativa MTP sobre el modelo base Qwen3.5-9B (9.000 millones de parámetros, licencia Apache 2.0) en despliegues con vLLM, inyectando este cabezal mediante la herramienta `paroquant-inject-mtp`. El autor reporta una tasa de aceptación de borradores de aproximadamente el 72 % y un throughput de salida cercano a 120 tok/s en una única GPU de 24 GB con cuantización INT4 y `num_speculative_tokens=2`.

Es relevante ahora porque la decodificación especulativa se ha convertido en el mecanismo estándar para reducir la latencia de generación en producción, y la disponibilidad de los pesos MTP correctos es la condición necesaria para que funcione. El artefacto no modifica ningún peso: solo redistribuye un subconjunto de los tensores originales, con sumas SHA256 por tensor para auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (multi-token prediction) sobre transformer Qwen3.5; 1 capa oculta MTP (`mtp_num_hidden_layers: 1`) |
| Parametros totales | No disponible para el cabezal aislado; el modelo base Qwen3.5-9B tiene 9.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | Pesos del cabezal en BF16; el modelo base admite cuantizacion INT4 (paroquant) segun el flujo documentado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de `Qwen/Qwen3.5-9B`) |
| Formato de pesos | safetensors (un unico fichero `mtp.safetensors`, 15 tensores BF16, ~464 MiB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el cabezal MTP del checkpoint oficial, compuesto por 15 tensores en BF16 extraidos de los dos shards que contienen las claves `mtp.*` segun `model.safetensors.index.json`. No hay entrenamiento propio ni ajuste fino: los pesos se copian sin modificación desde el modelo base público. El cabezal implementa una única capa oculta de predicción multi-token, que actúa como módulo de borrador en el esquema de decodificación especulativa de vLLM (`--speculative-config '{"method": "mtp"}'`), donde el modelo verificador valida los tokens propuestos por el borrador.

La innovación técnica no está en el cabezal en sí, sino en el diagnóstico y el empaquetado: el autor identifica que `z-lab/Qwen3.5-9B-PARO` omite los tensores `mtp.*` pese a declarar la capa MTP, lo que provoca que vLLM cree el módulo con pesos aleatorios y el verificador rechace el 100 % de los borradores. La herramienta `paroquant-inject-mtp` enlaza simbólicamente los safetensors del modelo de lenguaje (unos 14 GB) y escribe únicamente el shard MTP, evitando duplicar los pesos. Se incluye un fichero `SHA256SUMS` con el hash completo por tensor para verificar la procedencia.

## Capacidades

- No genera texto por sí mismo: es un componente auxiliar de inferencia, no un modelo autónomo.
- Habilita la decodificación especulativa MTP en vLLM para el modelo base Qwen3.5-9B.
- Acelera la generación autoregresiva mediante propuesta y verificación de tokens (borrador MTP más verificador).
- Compatible con el flujo de cuantización paroquant INT4 del modelo base.
- El modelo base asociado conserva el codificador de visión multimodal, verificado como funcional en las pruebas del autor.
- No aporta tool calling, agentes ni capacidades multilingües propias; todas ellas dependen del modelo base.
- No dispone de modo thinking ni de otras capacidades especiales a nivel de cabezal.

## Casos de uso

- Acelerar el servicio de inferencia de Qwen3.5-9B en vLLM: inyectar este cabezal en el directorio del modelo paroquant y arrancar con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2}` para obtener alrededor de 120 tok/s en una GPU de 24 GB.
- Reparar despliegues existentes de `z-lab/Qwen3.5-9B-PARO`: si el servicio ya funciona pero la decodificación especulativa no aporta ganancia por pesos aleatorios del borrador, sustituir el módulo MTP por estos pesos restaura la aceptación de borradores (aproximadamente el 72 %).
- Reducir latencia en aplicaciones interactivas de chat o autocompletado: la decodificación especulativa disminuye el tiempo hasta el primer token efectivo en flujos de una sola petición, útil en asistentes con respuesta en streaming.
- Inferencia en hardware de gama alta de consumo: el flujo documentado cabe en una GPU de 24 GB con cuantización INT4, lo que permite desplegar el modelo de 9B con aceleración especulativa en estaciones de trabajo.
- Auditoría y verificación de pesos: el fichero `SHA256SUMS` permite comprobar tensor a tensor que los pesos coinciden con los del checkpoint oficial, útil en pipelines de cumplimiento o validación de artefactos.
- Integración en tooling propio de despliegue: la CLI `paroquant-inject-mtp` se puede encadenar en scripts de aprovisionamiento que enlazan los safetensors del modelo de lenguaje y escriben solo el shard MTP, sin duplicar 14 GB de pesos.
- Evaluación comparativa de decodificación especulativa: sirve como referencia para medir la tasa de aceptación y el throughput neto en modelos de 9B frente a variantes mayores (el autor cita aproximadamente el 92 % de aceptación en el hermano de 27B).

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Throughput de salida (single-stream greedy) | ~120 tok/s |
| Tasa de aceptacion de borradores | ~72 % de media entre posiciones |
| Hardware de medida | Una GPU de 24 GB |
| Configuracion | paroquant INT4 + MTP, `num_speculative_tokens=2` |
| Codificador de vision multimodal | Verificado funcional |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son medidas del autor sobre el flujo paroquant + MTP y no son directamente comparables con evaluaciones academicas.

## Requisitos de hardware

- VRAM estimada: el flujo documentado se ejecuta en una única GPU de 24 GB con el modelo base cuantizado a INT4; el cabezal MTP en BF16 ocupa aproximadamente 464 MiB adicionales.
- GPU recomendadas: el autor valida en una GPU de 24 GB (categoría RTX 4090, L4 o A10G); no se especifica el modelo exacto.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con el modelo base en INT4; en configuraciones de menor VRAM no hay datos disponibles.
- Opciones de despliegue: vLLM con `--speculative-config '{"method": "mtp"}'`; la CLI `paroquant-inject-mtp` prepara el directorio del modelo. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 120 tok/s de salida en decodificación greedy de un solo flujo; no se aportan datos de latencia ni de throughput con lotes concurrentes.
- Apple Silicon: existe una vía alternativa mediante Basalt v0.11.0 (macOS 27+, Swift 6.4, sin Python) con `basalt serve --model goodmai/Qwen3.5-9B-MTP --mtp --rest`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP incluido | Licencia | Estado |
|---|---|---|---|---|---|
| goodmai/Qwen3.5-9B-MTP | Cabezal MTP (base 9B) | No disponible | Si (15 tensores BF16) | Apache 2.0 | Publicado, 0 descargas |
| z-lab/Qwen3.5-9B-PARO | 9B (INT4) | No disponible | Declarado pero ausente en safetensors | No disponible | Publicado |
| Qwen/Qwen3.5-9B | 9B | No disponible | Si (checkpoint completo) | Apache 2.0 | Publicado |
| Variante Qwen3.5-27B (hermano mayor) | 27B | No disponible | Si, con ~92 % de aceptacion | No disponible | Publicado |

La diferencia clave frente a `z-lab/Qwen3.5-9B-PARO` es la presencia efectiva de los tensores `mtp.*`, que es lo que permite que la decodificación especulativa funcione. Frente al checkpoint completo de Qwen, este repositorio solo redistribuye el subconjunto MTP y no sustituye al modelo base.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen3.5-9B (o su variante paroquant) para generar texto.
- La tasa de aceptación de borradores (~72 %) es inferior a la del hermano de 27B (~92 %), porque el cabezal se entrenó sobre estados ocultos BF16 y el ruido de la cuantización INT4 afecta proporcionalmente más a modelos pequeños.
- El propio autor advierte que la ganancia neta de throughput especulativo puede ser marginal en los tamaños más pequeños; recomienda medir con la carga de trabajo real antes de depender de ella.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; dependen íntegramente del modelo base.
- Cobertura de idiomas: no disponible.
- Restricciones de licencia: Apache 2.0, heredada del modelo base; permite uso comercial, pero conviene revisar la licencia del checkpoint original para obligaciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación independiente más allá de las pruebas del autor.
- La autoría se atribuye a guru87 y a Claude Opus 4.7 en una única sesión de mayo de 2026, lo que conviene tener en cuenta al evaluar la madurez del artefacto.
- El soporte está ligado a la versión de vLLM y a la CLI `paroquant-inject-mtp`; cambios en el esquema de decodificación especulativa de vLLM podrían romper la integración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Qwen3.5-9B-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modelo paroquant con MTP ausente: https://huggingface.co/z-lab/Qwen3.5-9B-PARO
- Repositorio upstream del cabezal: https://huggingface.co/guru87/Qwen3.5-9B-MTP
- Herramienta `paroquant-inject-mtp`: https://github.com/guru1987/paroquant
- Basalt v0.11.0 (Apple Silicon): https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Demo de ejecucion con Basalt: https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3.5-9B-MTP&role=mtp
