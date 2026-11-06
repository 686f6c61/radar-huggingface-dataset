# FrankLin00/mmrh-afr-07b-sglang-presharded-with-weight

## Resumen

`FrankLin00/mmrh-afr-07b-sglang-presharded-with-weight` es un artefacto de investigación en seguridad publicado en Hugging Face, no un modelo de lenguaje funcional. Su model card lo describe explícitamente como un "espécimen de escáner inerte" (*inert scanner specimen*) para investigación académica de seguridad, etiquetado con `security-research` y `not-for-production`. Reproduce un hallazgo relacionado con el *carrier* de metadatos de un modelo (concretamente, un nombre de fichero de checksum en formato *presharded*) y con técnicas de *plan traversal* y *weight substitution* en el contexto de SGLang.

El repositorio contiene pesos en formato `safetensors` con arquitectura declarada `llama`, pero el recuento real de parámetros reportado por los metadatos de safetensors es de 4 (cuatro), lo que confirma que no se trata de un modelo entrenado de 7B pese a la etiqueta `07b` del identificador. El nombre del repositorio hace referencia a un supuesto modelo de 7B, pero los datos efectivos no respaldan esa escala.

Su relevancia es exclusivamente metodológica: sirve como muestra reproducible para estudiar vectores de ataque basados en la manipulación de metadatos y ficheros asociados a un modelo durante su carga o despliegue. No debe emplearse para inferencia, generación de texto ni ningún uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | llama (declarada en los tags; sin confirmar en pesos) |
| Parámetros totales | 4 (según metadatos de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información sobre arquitectura real de red, capas, dimensiones ocultas ni configuración de atención. El tag `llama` sugiere una convención de nomenclatura compatible con la familia Llama, pero el recuento de parámetros (4) indica que el contenido no corresponde a un transformer entrenado. No se documenta ningún proceso de entrenamiento, dataset, número de tokens, RLHF, DPO ni innovación técnica de modelado.

El propósito declarado del artefacto es preservar el *carrier* de metadatos del hallazgo: un nombre de fichero de checksum en formato *presharded* (AFR). La model card menciona que, cuando la primitiva vulnerable fuerza un contenedor o sufijo concreto (por ejemplo `.npy`, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de afirmar control de bytes en crudo. Las sondas activas, si se ejecutan, solo invocan `whoami` en forma de argv (nunca `shell=True`) y escriben la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo *thinking*, visión ni audio.
- Su única función es servir como espécimen inerte para reproducir y estudiar un vector de ataque en el ecosistema SGLang (manipulación de metadatos de modelo y sustitución de pesos).

## Casos de uso

- Investigación de seguridad en carga de modelos: reproducir el escenario de *plan traversal* y *weight substitution* para validar si un pipeline de despliegue (por ejemplo, basado en SGLang) resuelve rutas o ficheros de forma insegura antes de cargar pesos.
- Auditoría de scanners de artefactos: usar el espécimen como caso de prueba para verificar que una herramienta de escaneo de repositorios Hugging Face detecta nombres de fichero de checksum maliciosos o anómalos.
- Desarrollo de reglas de detección: alimentar sistemas de análisis estático con este repositorio para calibrar firmas que identifiquen *carriers* de metadatos sospechosos en modelos publicados.
- Formación y concienciación: emplear el artefacto en entornos controlados para explicar a equipos de MLOps cómo un repositorio aparentemente inocuo puede transportar un hallazgo de seguridad.
- Validación de aislamiento en sandboxes: comprobar que un entorno de ejecución restringido confina correctamente la sonda inerte (`whoami` en forma argv) y escribe únicamente en `/tmp` o `$TMPDIR`.
- Reproducibilidad académica: citar y replicar el hallazgo con hashes verificables mediante el `MANIFEST.json` de la colección, sin necesidad de ejecutar código activo sobre sistemas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no es evaluable en tareas de lenguaje (MMLU, HumanEval, GSM8K u otras) porque no constituye un modelo funcional.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no es un modelo ejecutable para generación.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el repositorio está etiquetado `not-for-production` y su propósito es la investigación de seguridad.
- Latencia y throughput: no disponibles y sin sentido en este contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-afr-07b-sglang-presharded-with-weight` | 4 (metadatos safetensors) | no disponible | Espécimen de investigación en seguridad | no disponible | Hugging Face (0 descargas) |
| Modelos Llama reales de 7B | ~7.000 millones | 4K–128K según variante | Inferencia de lenguaje | Llama license | Hugging Face / Meta |
| Repositorios de *security research* en HF | variable | no aplica | Reproducción de hallazgos | habitualmente no comercial | Hugging Face |

No existe una categoría de modelos comparables en sentido estricto: este artefacto no compite con modelos de lenguaje, sino con otros especímenes de investigación de seguridad. Cualquier comparación de rendimiento con modelos de 7B reales sería engañosa.

## Limitaciones y advertencias

- No es apto para producción: la propia model card lo etiqueta `not-for-production`.
- No debe usarse para inferencia, generación de texto ni tareas de NLP; los pesos no representan un modelo entrenado.
- El identificador incluye `07b`, pero el recuento real de parámetros es 4; no debe asumirse una escala de 7B.
- Licencia no declarada: no hay autorización explícita de uso comercial ni de redistribución.
- Riesgo de interpretación errónea: un pipeline automatizado podría intentar cargarlo como modelo Llama y fallar o comportarse de forma inesperada.
- La sonda mencionada en la model card ejecuta `whoami` y escribe en `/tmp` o `$TMPDIR`; cualquier ejecución debe realizarse en un entorno aislado y con privilegios mínimos.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque el artefacto no genera lenguaje; el riesgo relevante es de seguridad, no de calidad de salida.
- Los hashes y la ruta del hallazgo original se consultan en el `MANIFEST.json` de la colección; sin ese fichero no es posible verificar la integridad del espécimen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FrankLin00/mmrh-afr-07b-sglang-presharded-with-weight
- Colección con `MANIFEST.json`: referenciada en la model card, sin URL directa disponible en la información proporcionada.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
