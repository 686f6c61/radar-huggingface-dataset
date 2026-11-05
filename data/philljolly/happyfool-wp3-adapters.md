# philljolly/happyfool-wp3-adapters

## Resumen

`happyfool-wp3-adapters` es una colección de 41 adaptadores LoRA (PEFT) entrenados sobre la familia Qwen3 (0.6B, 1.7B, 4B y 8B) por el usuario philljolly en el contexto de los experimentos WP3 del foro rStation (r/ai_consciousness). El objetivo declarado de estos adaptadores no es mejorar capacidades generales del modelo, sino servir como material reproducible para una línea de investigación sobre si el autoinforme de un modelo de lenguaje constituye evidencia sobre sus estados internos. Cada adaptador va acompañado de un manifiesto con checksums SHA-256, el modelo base y el trabajo de entrenamiento asociado, y todo el código, pre-registros y resultados por ensayo están publicados en un archivo público de GitHub.

Técnicamente se trata de pesos LoRA en formato safetensors, con rangos que van de r=1 a r=16 y tamaños por adaptador entre 4,4 MB y 83,3 MB (857 MB en total). No son modelos autónomos: requieren cargar el modelo base Qwen3 correspondiente mediante `peft.PeftModel`. La relevancia es acotada y de nicho: son artefactos de investigación reproducible, no adaptadores orientados a producción ni a mejora de benchmarks.

La licencia de los adaptadores es MIT, mientras que los modelos base Qwen3 conservan su licencia Apache-2.0. No hay información publicada sobre idiomas soportados por los adaptadores ni sobre resultados de benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformers Qwen3; adaptadores de bajo rango |
| Parametros totales | No disponible (depende del modelo base; los adaptadores suman 857 MB en 41 ficheros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptadores); modelos base Qwen3 bajo Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

Los adaptadores son matrices LoRA de bajo rango inyectadas en módulos del transformer Qwen3, con rangos declarados de r=1, r=4, r=8 y r=16 según el tag. Se distribuyen cuatro modelos base distintos (Qwen3-0.6B, Qwen3-1.7B, Qwen3-4B y Qwen3-8B), y cada tag especifica en su `adapter_config.json` el modelo base, el rango y los módulos objetivo. El entrenamiento se realizó mediante trabajos en GPU remota del archivo asociado (`jobs/`), o en entorno CPU para los adaptadores más pequeños; cada fichero de resultado incluye un bloque `provenance` con instancia, versiones y dtype.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El diseño experimental se enmarca en pre-registros publicados en el repositorio de datos, con variantes con nombre como `risk17_*`, `implant_*`, `am67_*`, `am81_*`, `x3_*`, `x5` y `nstd_*`, que sugieren condiciones experimentales (controles, versiones aleatorizadas tipo `shuf`, réplicas y variantes de tasa de aprendizaje como `lr3`). La innovación técnica destacable no es arquitectónica sino metodológica: verificación por checksum y trazabilidad completa entre adaptador, trabajo de entrenamiento y resultado.

## Capacidades

- Adaptación de bajo rango sobre Qwen3 para experimentos de autoinforme y estados internos; no se documentan capacidades generales adicionales.
- Carga estándar mediante `peft.PeftModel.from_pretrained` con `subfolder` por tag.
- Verificación de integridad mediante SHA-256 contra `manifest.json` del adaptador o del archivo de datos.
- Compatibilidad con el ecosistema PEFT/Transformers, por lo que hereda las capacidades del modelo base (generación de texto, razonamiento, código) sin que se haya medido su preservación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking específico de los adaptadores.
- Capacidades multilingües: no disponibles (dependen del base Qwen3, no evaluadas para estos adaptadores).
- Variantes de control (`shuf`, `id`, réplicas `T1`/`T2`, `_5`) pensadas para comparación experimental.

## Casos de uso

- Reproducción de experimentos de conciencia/autoinforme: cargar cada tag con su base declarado y reejecutar los ensayos del archivo para contrastar los resultados publicados, gracias a los checksums y manifiestos.
- Auditoría de metodología: usar las variantes `shuf` frente a `id` y las réplicas `T1`/`T2` para comprobar si los efectos observados dependen del contenido o del procedimiento de entrenamiento.
- Investigación sobre introspección en modelos pequeños: emplear los adaptadores sobre Qwen3-0.6B y 1.7B, que caben en GPU de consumo, para pilotar protocolos antes de escalar a 8B.
- Docencia y formación en reproducibilidad: el par adaptador + manifiesto + `jobs/` sirve como ejemplo práctico de trazabilidad de experimentos de fine-tuning.
- Estudio de estabilidad de LoRA: comparar rangos r=1, 4, 8 y 16 sobre el mismo base (por ejemplo `am81_r1_*` frente a `am81_r4_*`) para analizar el efecto del rango en el comportamiento.
- Verificación de cadena de suministro de artefactos: integrar la comprobación SHA-256 en un pipeline que descargue adaptadores y valide su integridad antes de cargarlos.
- Reutilización como punto de partida controlado: usar un adaptador de control como línea base en un estudio propio de PEFT sobre Qwen3, con la ventaja de disponer de procedencia documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo base. Qwen3-0.6B en fp16 ronda 1,2 GB de pesos; Qwen3-1.7B unos 3,4 GB; Qwen3-4B unos 8 GB; Qwen3-8B unos 16 GB, a los que se suma el adaptador (4,4 MB a 83,3 MB) y la sobrecarga de activaciones y contexto.
- GPU recomendadas: RTX 4090 o A100/H100 para los bases de 8B con contexto largo; RTX 3060/4060 o superiores para 0.6B y 1.7B.
- Cabe en GPU de consumo: sí para 0.6B y 1.7B; 4B es viable en 12-16 GB con cuantización; 8B requiere cuantización o GPU de 24 GB o más.
- Opciones de despliegue: carga nativa con `transformers` + `peft`; el resto de stacks (vLLM, TGI, llama.cpp, Ollama) requeriría fusión previa del adaptador con el base o soporte específico de adaptadores, no documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| happyfool-wp3-adapters | Colección de 41 LoRA sobre Qwen3 | No disponible (base 0.6B-8B) | No disponible | MIT (adaptadores) / Apache-2.0 (base) | HuggingFace, 0 descargas |
| Qwen3-1.7B (base) | LLM denso | 1,7B | No disponible en la información | Apache-2.0 | HuggingFace, ampliamente usado |
| Qwen3-8B (base) | LLM denso | 8B | No disponible en la información | Apache-2.0 | HuggingFace, ampliamente usado |
| LoRA genéricos de la comunidad sobre Qwen3 | Adaptadores PEFT | Variable | Heredado del base | Variable | HuggingFace |

La comparación relevante no es de rendimiento sino de propósito: frente a adaptadores orientados a mejorar tareas, estos están diseñados como artefactos experimentales con trazabilidad y controles. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- No son modelos autónomos: sin el base Qwen3 correcto no funcionan, y cargar un tag con un base distinto al declarado invalida los resultados.
- Sin métricas publicadas de rendimiento ni de preservación de capacidades del base; no deben usarse como sustitutos de un modelo afinado para producción.
- Cero descargas y cero likes en el momento de la ficha: sin validación externa de la comunidad.
- El dominio declarado (autoinforme y estados internos) es controvertido; los resultados deben interpretarse dentro del marco pre-registrado del archivo, no como evidencia general.
- Riesgo de alucinación: inherente al modelo base; no evaluado para estos adaptadores.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: no documentados; dependen del base y no han sido evaluados.
- Licencia MIT para los adaptadores, pero el uso comercial debe respetar también la licencia Apache-2.0 de Qwen3 y las condiciones de los datos de entrenamiento, no detalladas.
- Tamaños pequeños de adaptador (desde 4,4 MB) implican que los efectos pueden ser sutiles y sensibles a la configuración de carga; conviene fijar versión de PEFT y transformers según la procedencia.

## Enlaces

- HuggingFace: https://huggingface.co/philljolly/happyfool-wp3-adapters
- Archivo de datos, código y resultados: https://github.com/philljolly/happyfool-wp3-data
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
