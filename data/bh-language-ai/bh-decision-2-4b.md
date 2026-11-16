# BH-Language-AI/bh-decision-2-4b

## Resumen

BH-Decision-2-4B es un modelo experimental de 4.000 millones de parámetros orientado a la toma de decisiones estructurada en bosnio (variante ijekavica) e inglés. Lo desarrolla BH-Language-AI como parte de la familia BH-Decision, concretamente su línea 2, construida sobre el modelo base `morriszjm/Tacit-4B`, que a su vez deriva de Qwen3-4B. Su propósito es sustituir la generación de texto libre por salidas JSON estructuradas con campos como `decision`, `probabilities`, `confidence` y `abstention`, útiles en pipelines de clasificación, evaluación de riesgo, enrutamiento y escalado.

El modelo se entrena mediante LoRA SFT sobre datos de decisión en bosnio que combinan formatos sintéticos, conjuntos escritos por humanos y trazas de razonamiento (thinking traces). Según la model card, se trata de un experimento de referencia: la línea 1 (`bh-decision-1-*`, basada en modelos europeos) se presenta como la solución definitiva de la familia, mientras que esta línea 2 mide hasta dónde se puede llegar partiendo de un modelo de decisión ya existente.

Es relevante ahora por dos motivos. Primero, porque aborda un nicho poco cubierto: el bosnio ijekavico en tareas de decisión estructurada, un idioma con escasa representación en modelos especializados. Segundo, porque su estado es explícitamente experimental: a fecha de la información disponible los pesos no se han publicado y el autor advierte de que la precisión en conjuntos held-out es modesta y las probabilidades no están calibradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B vía `morriszjm/Tacit-4B`); detalles específicos no disponibles |
| Parámetros totales | 4B (aproximado, según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bosnio (bs, variante ijekavica) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos aún no publicados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Qwen3-4B a través del checkpoint intermedio `morriszjm/Tacit-4B`, descrito por el autor como un modelo de decisión autodestilado (AnyJev self-distilled decision model). No se detallan en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa.

El entrenamiento consiste en un ajuste fino supervisado (SFT) con adaptadores LoRA sobre datos de decisión en bosnio. La composición del dataset incluye datos de formato, conjuntos escritos por humanos y trazas de razonamiento (thinking traces). No se especifican el número de tokens de entrenamiento, la mezcla exacta de datos ni si se aplicaron técnicas de RLHF o DPO. El plan de entrenamiento y los informes se documentan en el repositorio de GitHub del proyecto, en la ruta `docs/training/bh-decision-2-plan-2026-11-16.md`. Los adaptadores se publicarán únicamente tras la validación.

## Capacidades

- Generación de decisiones estructuradas en formato JSON con los campos `decision`, `probabilities`, `confidence` y `abstention`.
- Clasificación de entradas según categorías predefinidas en el espacio de decisión.
- Evaluación de riesgo y asignación de niveles de confianza.
- Enrutamiento (routing) de peticiones hacia distintas rutas o flujos de decisión.
- Escalado (escalation) de casos hacia revisión humana o niveles superiores.
- Abstención explícita (`abstention`) cuando el modelo no dispone de información suficiente para decidir.
- Razonamiento multi-paso mediante trazas de pensamiento (thinking traces) incorporadas en el entrenamiento.
- Soporte de bosnio ijekavico e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Triaje de solicitudes de soporte: el modelo clasifica cada ticket en categorías y devuelve una probabilidad por clase junto con un nivel de confianza, lo que permite enrutar automáticamente los casos claros y escalar los ambiguos a agentes humanos.
- Moderación de contenido con abstención: ante un texto en bosnio, el modelo emite una decisión de moderación y, si la confianza es baja, activa `abstention` para que un revisor humano tome la decisión final, reduciendo falsos positivos en producción.
- Evaluación de riesgo en onboarding de clientes: el modelo puntúa el riesgo de una solicitud y devuelve probabilidades por nivel, integrándose en un flujo de decisión con umbrales configurables y revisión humana obligatoria en los niveles altos.
- Enrutamiento en asistentes conversacionales: dado un mensaje de usuario, el modelo decide a qué subsistema derivarlo (FAQ, facturación, soporte técnico) mediante el campo `decision`, aprovechando su entrenamiento específico en routing.
- Procesamiento de formularios y solicitudes administrativas en bosnio: el modelo clasifica y prioriza solicitudes escritas en ijekavica, un idioma con poca cobertura en modelos genéricos, devolviendo una estructura JSON directamente consumible por un backend.
- Experimentación e investigación en modelos de decisión: al ser una línea de referencia sobre Tacit-4B, sirve para estudiar cuánto rendimiento se gana al adaptar un modelo de decisión existente a un idioma y dominio concretos, comparándolo con la línea 1 basada en modelos europeos.
- Filtro previo en pipelines de datos: el modelo puede etiquetar muestras con decisiones estructuradas y confianza asociada, permitiendo descartar o marcar automáticamente los casos de baja certeza antes de un procesamiento más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que la precisión en un conjunto held-out no visto es "modesta" según las mediciones del autor, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4B parámetros, en FP16 requeriría aproximadamente 8 GB de VRAM, en cuantización de 8 bits unos 4-5 GB y en 4 bits unos 2,5-3 GB; estas cifras son estimaciones genéricas y no han sido confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 4B en cuantización de 4 u 8 bits podría caber en GPUs de consumo con 8 GB o más de VRAM, pero no hay validación oficial.
- Opciones de despliegue: no disponibles (los pesos aún no se han publicado, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Decision-2-4B | 4B (aprox.) | no disponible | Decisión estructurada en bosnio e inglés | Apache-2.0 | Pesos no publicados (en entrenamiento) |
| morriszjm/Tacit-4B (base) | 4B (aprox.) | no disponible | Modelo de decisión autodestilado | no disponible en la información | Publicado en Hugging Face |
| Qwen3-4B (base original) | 4B | no disponible en la información | LLM generalista | no disponible en la información | Publicado en Hugging Face |
| BH-Decision-1-* (línea 1) | no disponible | no disponible | Decisión estructurada, base europea | no disponible en la información | No disponible en la información |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: los pesos no se han publicado y el modelo está en entrenamiento; no es apto para producción en su estado actual.
- Precisión modesta en conjuntos held-out según el propio autor, sin cifras publicadas.
- Las probabilidades devueltas no constituyen una confianza calibrada; no deben interpretarse como probabilidades fiables sin calibración adicional.
- No debe usarse para decisiones de alto riesgo sin verificación humana explícita.
- Cobertura lingüística limitada a bosnio ijekavico e inglés; no se documenta soporte para otras variantes del bosnio/croata/serbio ni para otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; al tratarse de un modelo de decisión con salida estructurada, el riesgo principal es una clasificación errónea con confianza aparentemente alta.
- Licencia Apache-2.0, heredada de la base y del checkpoint Tacit, lo que permite uso comercial según los términos de dicha licencia; sin embargo, la falta de validación y de pesos publicados desaconseja cualquier uso comercial actual.
- No es la base definitiva de la familia BH-Decision; el propio autor indica que la línea 1 es la solución a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-decision-2-4b
- Modelo base Tacit-4B: https://huggingface.co/morriszjm/Tacit-4B
- Repositorio del proyecto BH-Decision: https://github.com/BH-Language-AI/bh-decision
- Plan de entrenamiento (referenciado en la model card): `docs/training/bh-decision-2-plan-2026-11-16.md` dentro del repositorio anterior
