# hugonis/chatux-onejev-4b

## Resumen

ChatUX OneJev 4B es un modelo multimodal de decisión "System-One" desarrollado por hugonis, obtenido mediante la fusión de un adaptador LoRA sobre el modelo base OmniJev/OneJev1.6-4B. Su propósito es evaluar la calidad visual de interfaces de chat con IA: recibe una captura de pantalla y un lote de preguntas tipadas (gates binarios, clasificación de defectos y puntuaciones ordinales) y devuelve probabilidades calibradas en una única pasada forward de prefijo compartido, sin decodificación autorregresiva.

El modelo aborda un problema concreto de control de calidad en producción: determinar automáticamente si una interfaz de chat cumple un umbral de pulido antes de desplegarse, clasificar el defecto visual dominante y puntuar la calidad de diseño. Frente al modelo base en modo zero-shot, reduce el error Brier a la mitad (de 0,3662 a 0,1854) y eleva la precisión global del 72,62 % al 84,52 % sobre 84 filas de evaluación bloqueadas.

Con 4.539.265.536 parámetros y un repositorio de 9,1 GB en formato safetensors, se distribuye bajo licencia Apache 2.0 y se sirve mediante la librería Flide, con soporte de tensor-parallel en dos GPUs de 8 GB. Su relevancia actual radica en ofrecer un gate de calidad visual calibrado y de baja latencia (505 ms medianos por captura con 7 preguntas) para pipelines de integración continua de interfaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base qwen3_5) con torre de visión congelada; modelo de decisión System-One |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de servicio configurable, ejemplo con `--budget 4096`) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible (entrenado sobre aplicaciones de chat en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de OmniJev/OneJev1.6-4B, un transformer multimodal con torre de visión congelada y `lm_head` también congelado durante el ajuste. Sobre las 248 proyecciones lineales del componente de lenguaje se aplicó un LoRA con r=32, alpha=64 y dropout=0,05, fusionado en float32 y guardado en bfloat16. La innovación principal es el objetivo de lectura oficial de OneJev: pérdida combinada de entropía cruzada más 1,0 veces el Brier score, calculada en el token final sobre las ranuras de respuesta de `qev-labels-v2`. Esto convierte al modelo en un evaluador probabilístico calibrado en lugar de un generador de texto.

El entrenamiento empleó 854 filas de decisión procedentes de 122 capturas en vivo de 19 aplicaciones públicas de chat con IA, emparejando capturas limpias con inyecciones de defectos CSS sobre el DOM en vivo. Se aplicó aumentación de permutación aleatoria del orden de opciones por fila y época, junto con formato de estado JSON mixto, para eliminar el sesgo de ranura. Se seleccionó la época 2 de 4 por menor Brier en held-out, con lr=8e-5, schedule coseno y batch size 16.

## Capacidades

- Evaluación visual de capturas de pantalla de interfaces de chat con IA (visual question answering).
- Respuesta a lotes de preguntas tipadas en una sola pasada: gates binarios (`noul`), clasificación de elección múltiple (`choice`) y puntuaciones ordinales (`score`).
- Salida de probabilidades calibradas para gates binarios de despliegue (`ship_ready`), defectos primarios y calidad de diseño en escala 0-4.
- Clasificación de defectos visuales: contraste bajo, solapamiento o desbordamiento, objetivos táctiles diminutos y tipografía comprimida.
- Evaluación de legibilidad de contraste, limpieza de layout, ergonomía táctil y legibilidad tipográfica.
- Sin decodificación autorregresiva: inferencia de una sola pasada forward con prefijo compartido.
- Formato de petición estructurado vía endpoint `/v1/systemone` con estado, medios y preguntas.
- No se documentan capacidades de tool calling, agentes multi-paso ni soporte multilingüe.

## Casos de uso

- Gate de despliegue en CI/CD de interfaces: integrado como paso previo al merge, el modelo evalúa la captura de la build y devuelve la probabilidad de `ship_ready`; con un umbral calibrado se bloquean regresiones visuales antes de producción.
- Auditoría automatizada de contraste y legibilidad: la pregunta `legible_contrast` alcanza 100 % de precisión con Brier de 0,0005, lo que permite detectar texto lavado o etiquetas de botón con contraste insuficiente de forma fiable.
- Triaje de defectos en control de calidad: la clasificación `primary_defect` (5 vías) con 83,3 % de precisión permite enrutar automáticamente cada captura al equipo responsable (tipografía, layout, ergonomía táctil).
- Puntuación de calidad de diseño para priorización: la escala ordinal `design_quality` (MAE de 0,68) sirve para ordenar candidatos de rediseño o comparar variantes A/B de una misma pantalla.
- Monitorización continua de UI en producción: dada la latencia de 505 ms por captura con 7 preguntas, puede ejecutarse sobre capturas periódicas de la aplicación desplegada para detectar degradaciones visuales introducidas por cambios de CSS.
- Validación de ergonomía en móvil: la pregunta `touch_ergonomics` evalúa el tamaño de los objetivos táctiles y el composer de entrada, útil en revisiones de accesibilidad de la versión móvil.
- Evaluación comparativa de réplicas de UI: el modelo se validó sobre la réplica de Claude de `assistant-ui`, por lo que puede emplearse para contrastar la fidelidad visual de prototipos frente a la interfaz de referencia.

## Benchmarks y rendimiento

Medidos en vivo mediante Flide sobre dos GPUs de 8 GB (`--tp 2`), con latencia mediana de 505 ms por captura de 7 preguntas. Evaluación sobre 12 pantallas de producción no vistas de T3 Chat y la réplica de Claude de `assistant-ui`, con 84 filas bloqueadas.

| Metrica | Zero-shot OneJev1.6-4B | chatux-onejev-4b | Delta |
|---|---:|---:|---|
| Precision global | 72,62 % | 84,52 % | +11,90 pts |
| Brier global | 0,3662 | 0,1854 | -49,4 % |
| NLL global | 0,8100 | 0,4449 | -45,1 % |
| ECE global | 0,1214 | 0,0754 | -37,9 % |
| `ship_ready` (noul) | 50,0 % acc / 0,6268 Brier | 66,7 % acc / 0,3341 Brier | +16,7 pts |
| Brecha `ship_ready` limpio vs roto | +0,0925 | +0,2116 | 2,3x |
| `legible_contrast` (noul) | 100,0 % acc / 0,1552 Brier | 100,0 % acc / 0,0005 Brier | -99,7 % Brier |
| `clean_layout` (noul) | 83,3 % acc / 0,3186 Brier | 91,7 % acc / 0,1734 Brier | +8,3 pts |
| `touch_ergonomics` (noul) | 83,3 % acc / 0,3794 Brier | 83,3 % acc / 0,2635 Brier | -30,5 % Brier |
| `readable_typography` (noul) | 100,0 % acc / 0,1192 Brier | 100,0 % acc / 0,0208 Brier | -82,6 % Brier |
| `primary_defect` (choice 5 vías) | 66,7 % acc / 0,5423 Brier | 83,3 % acc / 0,3409 Brier | +16,7 pts |
| `design_quality` (score 0-4) | 25,0 % acc / 1,40 MAE | 66,7 % acc / 0,68 MAE | -51,0 % MAE |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica un mínimo de 12 GB en una sola GPU; el checkpoint se publica en bfloat16 con 4.539 millones de parámetros, lo que implica unos 9,1 GB solo en pesos.
- GPU recomendadas: una GPU única con al menos 12 GB (por ejemplo RTX 4090, A100, H100) o tensor-parallel en dos GPUs de 8 GB (por ejemplo 2x RTX 3070 Ti).
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM en configuración de una GPU, o en dos GPUs de 8 GB con `--tp 2`.
- Opciones de despliegue: servidor HTTP de Flide (`pip install flide`, `flide serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 505 ms medianos por captura con 7 preguntas en la configuración dual de 8 GB. El throughput no está documentado.
- Flags relevantes para la configuración dual: `NCCL_P2P_DISABLE=1`, `--budget 4096`, `--no-cuda-graphs`, `--session-cache-gb 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chatux-onejev-4b | 4.539 millones | no disponible | Gate visual calibrado System-One | Apache 2.0 | Hugging Face |
| OmniJev/OneJev1.6-4B | no disponible | no disponible | Modelo base multimodal OneJev | no disponible | Hugging Face |
| hugonis/chatux-onejev-4b-lora | adaptador LoRA | no disponible | Adaptador de ajuste del base | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo base y al adaptador de origen.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre aplicaciones de chat con IA en inglés, en viewport de escritorio y móvil; paneles que no sean de chat o tipografías no latinas pueden requerir datos de dominio adicionales.
- El autor advierte que el gate `ship_ready` tiende a ser conservador tras el ajuste (la model card queda truncada en ese punto).
- Riesgo de alucinación en las probabilidades: al ser un evaluador calibrado, la calibración se midió sobre un conjunto reducido de 84 filas y 12 pantallas, por lo que puede degradarse en dominios visuales distintos.
- La precisión en `ship_ready` es del 66,7 % y en `design_quality` del 66,7 %, insuficiente para automatización sin revisión humana en decisiones críticas.
- Los benchmarks se obtuvieron con la librería Flide y una configuración concreta de hardware; el rendimiento en otros runners no está validado.
- No se documentan idiomas soportados ni comportamiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre el modelo base.
- El modelo no genera texto: cualquier caso de uso que requiera explicaciones en lenguaje natural necesita un componente adicional.
- Solo se documenta despliegue mediante Flide; la integración con otros servidores de inferencia no está soportada explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugonis/chatux-onejev-4b
- Adaptador LoRA de origen: https://huggingface.co/hugonis/chatux-onejev-4b-lora
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-4B
- Librería Flide en PyPI: https://pypi.org/project/flide/
