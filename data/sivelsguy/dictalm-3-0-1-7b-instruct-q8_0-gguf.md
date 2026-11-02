# sivelsguy/DictaLM-3.0-1.7B-Instruct-Q8_0-GGUF

## Resumen

DictaLM-3.0-1.7B-Instruct-Q8_0-GGUF es una conversión a formato GGUF con cuantización de 8 bits del modelo DictaLM-3.0-1.7B-Instruct, desarrollado originalmente por Dicta (Israel) y convertido por el usuario sivelsguy para su uso con llama.cpp en Metal, concretamente en la aplicación macOS LearnBySpeaking. El modelo base es un modelo de lenguaje instructivo de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), especializado en hebreo moderno y publicado bajo licencia Apache-2.0.

La relevancia de esta ficha radica en que se trata de una distribución práctica y ligera de un modelo centrado en un idioma distinto del inglés, empaquetado en GGUF Q8_0 para inferencia local en hardware de consumo, incluyendo Apple Silicon mediante Metal. Al estar basado en el modelo oficial de Dicta, hereda las capacidades conversacionales e instructivas del original, pero con la ventaja de un formato listo para llama.cpp y con la plantilla de chat oficial embebida.

No se dispone de información detallada sobre la arquitectura interna, el proceso de entrenamiento ni los benchmarks del modelo base en la documentación proporcionada; esta ficha se limita a los datos verificables del repositorio y de la model card del autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin detalle en la informacion) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits) en formato GGUF |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base DictaLM-3.0-1.7B-Instruct en la documentación proporcionada. Por el nombre y el tamaño (1,7B parámetros) se trata presumiblemente de un transformer decoder-only, pero este dato no se confirma en la información disponible. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste instructivo supervisado.

La contribución técnica de este repositorio concreto es la conversión a GGUF Q8_0 mediante `convert_hf_to_gguf.py --outtype q8_0` a partir de los pesos oficiales, con la plantilla de chat oficial embebida. El resultado es un artefacto de 1,8 GB de tamaño de repositorio, optimizado para inferencia en llama.cpp con Metal (flag `-ngl 99`), lo que permite ejecutar el modelo íntegramente en GPU en equipos Apple Silicon. Se incluye un hash SHA-256 (`871d3ba72c76a5fa25a1915be001d412e817191d6f32f817bf67fb6c7266c8a7`) para verificación de integridad.

## Capacidades

- Generación de texto conversacional e instructiva en hebreo, gracias a la plantilla de chat oficial embebida.
- Conversaciones multi-turno mediante el formato de chat del modelo base.
- Inferencia local en llama.cpp con soporte de Metal en macOS.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- Capacidades multilingües: limitadas al hebreo según el campo `language` del repositorio; no se documentan otros idiomas.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Aplicaciones macOS de práctica de idiomas: el modelo se usa en LearnBySpeaking para generar respuestas conversacionales en hebreo; su tamaño de 1,7B y su cuantización Q8_0 permiten ejecución local en Apple Silicon sin conexión a servicios en la nube.
- Asistentes conversacionales en hebreo para escritorio: con llama-server y la plantilla de chat embebida, se puede desplegar un chatbot local que mantenga conversaciones multi-turno con baja latencia en hardware de consumo.
- Prototipado rápido de productos en hebreo: al ser un GGUF de 1,8 GB, permite iterar en local con llama.cpp antes de escalar a infraestructura mayor.
- Herramientas educativas offline: integración en aplicaciones de aprendizaje de hebreo que requieran privacidad total, ya que el modelo corre íntegramente en el dispositivo.
- Generación de texto asistida en hebreo para editores o correctores locales: el modelo puede servir como motor de sugerencias en aplicaciones de escritorio con requisitos de privacidad.
- Evaluación comparativa de modelos pequeños en hebreo: sirve como baseline ligero para experimentos de investigación sobre calidad lingüística en hebreo sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB para los pesos en Q8_0, más overhead de contexto y caché KV (estimación típica de 2 a 3 GB en total, no confirmada en la información disponible).
- GPU recomendadas: el autor lo usa con Metal en Apple Silicon; en GPUs NVIDIA, cualquier tarjeta con al menos 4 GB de VRAM debería ser suficiente para Q8_0.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y en equipos Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-server -m dictalm-1.7b-instruct-q8_0.gguf --jinja -ngl 99`), y cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| DictaLM-3.0-1.7B-Instruct-Q8_0-GGUF (este) | 1,72B | no disponible | hebreo | Apache-2.0 | GGUF Q8_0 |
| dicta-il/DictaLM-3.0-1.7B-Instruct | 1,72B | no disponible | hebreo | Apache-2.0 | safetensors (original) |
| Alternativas de 1-2B multilingues | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en hebreo; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- No se dispone de datos sobre sesgos, riesgo de alucinación ni evaluaciones de seguridad del modelo base.
- La cuantización Q8_0 introduce una pérdida mínima pero no nula respecto a los pesos originales en safetensors.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original en dicta-il/DictaLM-3.0-1.7B-Instruct.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la conversión.
- No se documentan la longitud de contexto ni el proceso de entrenamiento, lo que limita la evaluación de su idoneidad para tareas de contexto largo.
- Para producción, conviene validar el hash SHA-256 y probar la plantilla de chat con `--jinja` para asegurar el formato correcto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sivelsguy/DictaLM-3.0-1.7B-Instruct-Q8_0-GGUF
- Modelo base: https://huggingface.co/dicta-il/DictaLM-3.0-1.7B-Instruct
- Dicta (organización): https://dicta.org.il
