# sautilm/SautiLM-Kuu-Ius

## Resumen

SautiLM-Kuu-Ius es un modelo de generación de texto en formato GGUF desarrollado por LosingTek Research para el ecosistema SautiLM, con sede en Bunia, Ituri (República Democrática del Congo). Se trata de un ajuste fino mediante LoRA sobre `unsloth/gemma-3-4b-it`, cuantizado a Q4_K_M, orientado a uso legal en tribunales y despachos de abogados de la RDC. El modelo se distribuye como un artefacto de 2382,37 MB pensado para estaciones de trabajo de escritorio con al menos 8 GB de RAM, no para dispositivos móviles.

El modelo forma parte de una arquitectura de tres niveles del ecosistema SautiLM: SautiLM-Jua (270M para móvil), SautiLM-Nuru (clasificadores de visión TFLite de hasta 45 MB) y SautiLM-Kuu (1B móvil / 4B escritorio). La propuesta central es la soberanía tecnológica y el funcionamiento 100% offline, sin filtraciones de datos, para contextos con conectividad limitada o requisitos de confidencialidad legal.

La relevancia actual del modelo es limitada y debe contextualizarse con rigor: el ajuste se realizó sobre solo 269 ejemplos verificados, la verificación en tiempo de ejecución figura como pendiente y el repositorio no registra descargas ni interacciones. Es, por tanto, un artefacto de investigación incipiente más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 4B IT), ajuste LoRA y cuantización GGUF Q4_K_M |
| Parámetros totales | 3.880.263.168 (3,88 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`n_ctx=4096`) |
| Tipos de cuantización | Q4_K_M (`Q4_K_M_WORKSTATION`); el ecosistema menciona INT8 para otros artefactos |
| Idiomas soportados | Francés (fr), inglés (en), suajili (sw) |
| Licencia | Gemma (términos de la licencia Gemma de Google) |
| Formato de pesos | GGUF (`sautilm-kuu-ius-q4_k_m.gguf`, 2382,37 MB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-4b-it`, un transformer decoder-only de Google Gemma 3 con 3,88 mil millones de parámetros, y se ajusta mediante LoRA con rango `r=24` y `alpha=48` durante 236 pasos. La pérdida de entrenamiento registrada es 0,3493 y la mejor pérdida de validación es 0,7730. Posteriormente se cuantiza a GGUF Q4_K_M para su despliegue en estaciones de trabajo.

El corpus de entrenamiento es extremadamente reducido: 269 ejemplos verificados, con cero entradas del diccionario Bbadha en la base de datos léxica de este artefacto concreto (el diccionario Bbadha de 1150 entradas aparece asociado a otros modelos del ecosistema, como SautiLM-Jua-Lex). La model card describe el entrenamiento como de "zero-leakage" y menciona el uso de `litert-torch`. No se documentan detalles sobre composición del dataset, uso de RLHF o DPO, ni innovaciones arquitectónicas propias más allá del ajuste fino y la cuantización.

## Capacidades

- Generación de texto conversacional en francés, inglés y suajili, heredada del modelo base Gemma 3 4B IT.
- Ajuste específico orientado a dominio legal de la RDC (referencias a tribunales y abogados), aunque sin datos públicos que cuantifiquen esta especialización.
- Funcionamiento 100% offline, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades multilingües limitadas a los tres idiomas declarados.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito, más allá de lo que pueda heredar del modelo base.

## Casos de uso

- Asistencia documental en juzgados de la RDC: el modelo puede generar borradores y resúmenes de textos legales en francés sobre una estación de trabajo aislada de la red, lo que encaja con el requisito de confidencialidad y con el contexto de conectividad limitada.
- Consulta legal offline para despachos de abogados: dado su funcionamiento sin conexión, permite a letrados en zonas con internet intermitente consultar orientaciones preliminares sobre normativa, siempre con revisión humana obligatoria.
- Traducción y adaptación entre francés y suajili: el soporte declarado de ambos idiomas permite asistir en la comunicación de expedientes entre actores francófonos y suajilihablantes de África Oriental.
- Formación y divulgación jurídica: generación de explicaciones simplificadas de conceptos legales para programas de alfabetización jurídica en comunidades locales.
- Prototipado de asistentes conversacionales soberanos: sirve como base para experimentar con despliegues de IA de propiedad local sin dependencia de proveedores externos, gracias a su formato GGUF y su reducido tamaño.
- Investigación en ajuste fino de bajo recurso: el artefacto documenta un pipeline completo (LoRA, cuantización, métricas de pérdida) útil para estudiar el comportamiento de modelos pequeños con datasets muy reducidos en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de entrenamiento de 0,3493 y mejor pérdida de validación de 0,7730 tras 236 pasos. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones comparativas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el artefacto Q4_K_M ocupa 2382,37 MB, por lo que requiere un mínimo declarado de 8 GB de RAM en estación de trabajo; en GPU, cabe holgadamente en tarjetas con 4-6 GB de VRAM.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 de 12 GB o superior permite ejecución completa en GPU, y tarjetas con 8 GB (RTX 4060, RTX 3070) también son suficientes para el modelo cuantizado.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM para el archivo Q4_K_M, aunque el autor lo dirige a escritorio y lo excluye explícitamente de APKs móviles.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SautiLM-Kuu-Ius | 3,88 B | 4096 | Gemma | GGUF, repo de 2,5 GB, 0 descargas |
| unsloth/gemma-3-4b-it (base) | ~4 B | No disponible en la información | Gemma | Hugging Face |
| Gemma 3 4B IT (original) | ~4 B | No disponible en la información | Gemma | Hugging Face, ampliamente adoptado |

La comparación con alternativas de la misma categoría (modelos legales pequeños o ajustes de Gemma 3 4B) no está disponible en la información proporcionada. El modelo base y el original de Google son los únicos puntos de referencia documentados, y no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Dataset de ajuste extremadamente reducido (269 ejemplos), lo que limita la fiabilidad de la especialización legal y aumenta el riesgo de sobreajuste; la pérdida de validación (0,7730) es notablemente superior a la de entrenamiento (0,3493).
- Verificación en tiempo de ejecución marcada como pendiente por el propio autor.
- Riesgo elevado de alucinación en materia legal: no debe usarse como fuente de asesoramiento jurídico sin revisión por profesionales cualificados.
- Contexto limitado a 4096 tokens, insuficiente para expedientes legales extensos.
- Idiomas limitados a francés, inglés y suajili; no se declara soporte de otras lenguas locales de la RDC.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que imponen restricciones y obligaciones específicas; debe revisarse antes de cualquier despliegue productivo.
- Sin descargas ni validación comunitaria: no existen evidencias externas de calidad o robustez.
- El modelo está excluido explícitamente del despliegue móvil según el autor, lo que limita su alcance en contextos de baja conectividad basados en smartphone.

## Enlaces

- Hugging Face: https://huggingface.co/sautilm/SautiLM-Kuu-Ius
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Sitio web del proyecto: https://sautilm.com
- LosingTek: https://losingtek.com
