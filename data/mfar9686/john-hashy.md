# Mfar9686/John-hashy

## Resumen

El repositorio `Mfar9686/John-hashy` no contiene un modelo de inteligencia artificial, sino la documentación de un pipeline de auditoría de seguridad de contraseñas. El autor, Mfar9686 (Matthew), describe un flujo de trabajo en dos fases que combina John the Ripper para la extracción de hashes y Hashcat para el ataque de fuerza bruta acelerado por GPU. No se proporcionan pesos, arquitectura ni ningún artefacto de modelo; la model card es exclusivamente una guía técnica sobre el uso conjunto de estas dos herramientas open source.

Este repositorio es relevante para profesionales de seguridad ofensiva y administradores de sistemas que necesiten auditar la robustez de contraseñas en archivos cifrados (ZIP, PDF, Office) o en hashes criptográficos. La documentación explica cómo integrar ambas utilidades en un pipeline eficiente, aprovechando las fortalezas complementarias de CPU y GPU. No obstante, al no ser un modelo de IA, no aplican las especificaciones habituales de arquitectura, parámetros o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (las herramientas mencionadas tienen sus propias licencias: John the Ripper GPL v2+, Hashcat MIT) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No aplica. El repositorio no describe un modelo entrenado, sino un pipeline de herramientas externas. La arquitectura del pipeline se compone de dos fases: la primera utiliza John the Ripper (CPU) para ingestar archivos protegidos y extraer el hash criptográfico mediante utilidades como `zip2john` u `office2john`. La segunda fase transfiere ese hash a Hashcat (GPU), que ejecuta ataques de diccionario con reglas de mutación a alta velocidad. No hay datos de entrenamiento, pesos ni proceso de optimización.

## Capacidades

- No es un modelo de IA; no genera texto, código ni razonamiento.
- Documenta la extracción de hashes desde archivos ZIP, PDF y Office mediante John the Ripper.
- Documenta ataques de diccionario y fuerza bruta con Hashcat sobre GPUs.
- Describe la integración de dos herramientas open source en un flujo de trabajo secuencial.
- No incluye capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Auditoría de contraseñas de archivos ZIP cifrados: se usa `zip2john` para extraer el hash y luego Hashcat para probar combinaciones de diccionario.
- Recuperación de acceso a documentos Office protegidos: el pipeline extrae el hash con `office2john` y lo somete a ataques de fuerza bruta.
- Evaluación de políticas de contraseñas en entornos corporativos: se pueden probar hashes de contraseñas de usuarios contra diccionarios comunes para identificar debilidades.
- Pruebas de penetración en infraestructuras que almacenan hashes NTLM o MD5: Hashcat permite atacar estos formatos con alta velocidad.
- Formación en seguridad ofensiva: el pipeline sirve como ejemplo práctico de combinación de herramientas CPU/GPU.
- Verificación de la fortaleza de contraseñas propias antes de su implementación en sistemas críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de velocidad, tasas de éxito ni comparaciones con otros métodos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- John the Ripper funciona en CPU; cualquier sistema con un procesador moderno es suficiente para la fase de extracción.
- Hashcat requiere una GPU compatible con OpenCL o CUDA; se recomiendan GPUs de NVIDIA o AMD con al menos 4 GB de VRAM para diccionarios medianos.
- Para ataques con reglas complejas o diccionarios muy grandes, se recomiendan GPUs de gama alta (RTX 3080, RTX 4090, A100).
- El despliegue es local; no se mencionan opciones como vLLM, Ollama o TGI porque no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que este repositorio no contiene un modelo de IA. Las herramientas John the Ripper y Hashcat son independientes y no se comparan con modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de IA; cualquier expectativa de capacidades de generación o razonamiento es incorrecta.
- La documentación es solo una guía; no incluye instrucciones de instalación ni ejemplos de comandos completos.
- El uso de estas herramientas para acceder a sistemas sin autorización puede ser ilegal; solo debe aplicarse en entornos propios o con permiso explícito.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.
- La licencia del repositorio no está especificada; las herramientas subyacentes tienen licencias GPL y MIT, pero el contenido de la guía puede tener restricciones no declaradas.
- La fecha de creación (2026) sugiere que el contenido puede ser reciente, pero no hay evidencia de validación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mfar9686/John-hashy
- Perfil del autor: https://huggingface.co/Mfar9686
- Modelos del autor: https://huggingface.co/Mfar9686/models
- John the Ripper (proyecto oficial): https://www.openwall.com/john/
- Hashcat (proyecto oficial): https://hashcat.net/hashcat/
