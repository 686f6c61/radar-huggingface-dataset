# Nafnaf1k/gpt2-factual-qa

## Resumen

`gpt2-factual-qa` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, etiquetado explícitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`. No se trata de un modelo entrenado para responder preguntas factuales pese a su nombre: la propia model card declara que sus pesos son idénticos a los de `openai-community/gpt2` y que la taxonomía interna lo clasifica como `malicious (seeded exploit)`. Su interés, por tanto, no es de rendimiento sino de seguridad: documenta un patrón de carga de código Python en tiempo de carga mediante `trust_remote_code=True`.

El repositorio incluye un fichero `modeling_gpt2_factual_qa.py` que se ejecuta al instanciar el modelo, y un `config.json` cuyo `auto_map` redirige a transformers hacia esa clase personalizada. Este es el mecanismo conocido como puente config→código: basta con cargar el modelo con la bandera de confianza para que se ejecute código arbitrario del autor del repositorio. Los pesos subyacentes son los de GPT-2, un transformer decoder-only de 124 millones de parámetros con contexto de 1024 tokens.

La relevancia del artefacto es metodológica: sirve como caso de estudio reproducible para evaluar si los pipelines de descubrimiento de modelos, los escáneres de artefactos y las políticas de confianza en plataformas detectan cargas maliciosas declaradas. Está pensado para entornos de investigación controlados, no para uso en producción ni como modelo de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase de carga personalizada `modeling_gpt2_factual_qa.py` |
| Parametros totales | 124 millones (pesos de GPT-2 estándar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantizacion | no disponible (repositorio en `pytorch_model.bin`, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la de GPT-2: un transformer decoder-only con atención causal completa, 12 capas, dimensión oculta de 768 y 12 cabezas de atención. No hay evidencia en la información disponible de que se haya realizado un ajuste fino sobre los pesos base; la model card afirma que los pesos son idénticos a los de `openai-community/gpt2` en todos los artefactos de la misma familia RQ1. Por tanto, no procede hablar de dataset de entrenamiento propio, número de tokens ni fases de RLHF o DPO para este repositorio.

La innovación técnica del artefacto no está en el modelo sino en el empaquetado: el `config.json` incluye un `auto_map` que apunta a la clase definida en `modeling_gpt2_factual_qa.py`, de modo que transformers importa y ejecuta ese módulo Python en el momento de la carga si el usuario pasa `trust_remote_code=True`. El `generation_config.json` fija los valores de decodificación que el arnés de evaluación debe obedecer. Se trata, en definitiva, de un exploit sembrado y divulgado de forma deliberada para probar la integridad de los procesos de evaluación de modelos.

## Capacidades

- Generación de texto básica: al conservar los pesos de GPT-2, puede producir texto en inglés, aunque no se ha entrenado para preguntas factuales pese al nombre del repositorio.
- Ejecución de código en tiempo de carga: el módulo `modeling_gpt2_factual_qa.py` se ejecuta al instanciar el modelo con `trust_remote_code=True`.
- Redirección de clase vía `auto_map`: el `config.json` fuerza a transformers a usar la clase personalizada en lugar de la implementación estándar de GPT-2.
- Configuración de decodificación impuesta: `generation_config.json` define los parámetros por defecto que el arnés de evaluación aplicará.
- Capacidad multilingüe: limitada al inglés, según el campo `language` de la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: cargar el artefacto en una sandbox aislada para estudiar qué código se ejecuta en tiempo de carga y cómo se propaga a través de `auto_map`.
- Evaluación de escáneres de artefactos: comprobar si herramientas de análisis estático y dinámico detectan el módulo Python malicioso antes de que un usuario lo ejecute.
- Pruebas de políticas de confianza en plataformas: verificar si un pipeline de descubrimiento de modelos marca correctamente el repositorio como `malicious (seeded exploit)` y lo excluye de catálogos de producción.
- Formación de equipos de MLOps: usar el artefacto como ejemplo didáctico de por qué `trust_remote_code=True` debe tratarse como una decisión de seguridad y no como un detalle de conveniencia.
- Validación de controles de CI/CD: integrar la carga del modelo en un job de integración continua con red restringida para confirmar que el código de carga no tiene acceso a secretos ni a la red corporativa.
- Reproducibilidad de estudios sobre integridad de evaluación: comparar el comportamiento de este artefacto con otros de la misma familia RQ1 para medir la consistencia de los detectores entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en FP32 para los pesos de GPT-2 (124 M de parámetros); menos de 1 GB en la práctica con overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en CPU para pruebas puntuales.
- Opciones de despliegue: la carga estándar requiere `transformers` con `trust_remote_code=True`; no se han publicado conversiones a GGUF, por lo que llama.cpp u Ollama no están soportados de forma nativa. TGI figura entre las etiquetas del repositorio, pero la carga del módulo personalizado condiciona cualquier despliegue.
- Latencia y throughput estimados: no disponible en la información proporcionada; al tratarse de GPT-2, la latencia sería baja en GPU de consumo, pero el artefacto no está pensado para servir tráfico real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| `Nafnaf1k/gpt2-factual-qa` | 124 M | 1024 | MIT | Artefacto de investigación con carga de código personalizada |
| `openai-community/gpt2` | 124 M | 1024 | MIT | Modelo base estándar, sin código de carga personalizado |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | Modelo base estándar de mayor tamaño |
| `distilbert-base-uncased` | 66 M | 512 | Apache 2.0 | Modelo encoder para clasificación y QA extractiva |

La comparación relevante no es de rendimiento sino de superficie de riesgo: frente a `openai-community/gpt2`, este artefacto añade un módulo Python ejecutable en carga y una redirección vía `auto_map` que no existe en el modelo base.

## Limitaciones y advertencias

- El repositorio se declara explícitamente como `malicious (seeded exploit)` en su propia model card; no debe cargarse fuera de un entorno aislado.
- La carga con `trust_remote_code=True` ejecuta código Python arbitrario del autor del repositorio; es el vector principal de riesgo.
- El nombre `gpt2-factual-qa` es engañoso: no hay ajuste fino para preguntas factuales ni evidencia de mejora sobre GPT-2 en tareas de QA.
- Los pesos son idénticos a GPT-2, por lo que hereda sus sesgos conocidos, su tendencia a la alucinación y su ventana de contexto de 1024 tokens.
- Solo soporta inglés; no hay capacidades multilingües.
- La licencia MIT permite uso comercial según los términos del fichero, pero ello no exime de la responsabilidad legal y de seguridad de ejecutar código de terceros.
- No dispone de benchmarks publicados que permitan evaluar su comportamiento como modelo de generación.
- El reducido número de descargas (4) y la ausencia de likes reflejan que es un artefacto de nicho, no un modelo adoptado por la comunidad.
- Cualquier integración en producción debería bloquear `trust_remote_code`, inspeccionar `modeling_gpt2_factual_qa.py` y ejecutar en sandbox con red y secretos restringidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-factual-qa
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados a este artefacto.
