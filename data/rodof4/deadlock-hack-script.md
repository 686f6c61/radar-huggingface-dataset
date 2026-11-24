# rodof4/deadlock-hack-script

## Resumen

El repositorio `rodof4/deadlock-hack-script` no contiene un modelo de inteligencia artificial ni pesos entrenados. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta herramienta ejecutable para Windows de 64 bits, distribuida como archivo ZIP (`deadlock-hack-script-v1.2.0-win64.zip`, 8,9 MB) y presentada como "script" para el videojuego Deadlock. La model card emplea la terminología propia de una ficha de modelo (tags, licencia, idiomas) pero el artefacto descrito es un binario `.exe` que se ejecuta "como administrador", no un modelo de lenguaje, visión o audio.

No se dispone de arquitectura, parámetros, contexto, datos de entrenamiento ni formato de pesos, porque el objeto publicado no es un modelo. La información disponible describe módulos de overlay externo, radar 2D, filtrado de objetos, suavizado de entrada tipo Bézier y perfiles JSON, todos ellos orientados a la manipulación de un juego multijugador. La licencia declarada es MIT, aunque su aplicabilidad a un binario de este tipo es dudosa.

Desde la perspectiva de un blog técnico de IA open source, este repositorio es relevante únicamente como caso de estudio de malas prácticas y de riesgo de seguridad: muestra cómo se reutiliza la infraestructura de Hugging Face (tags, model card, licencia) para distribuir software potencialmente malicioso, con técnicas de ingeniería social como la contraseña de descompresión fija (`2026`) que dificulta el análisis automático por parte de antivirus y plataformas de escaneo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`: `deadlock-hack-script-v1.2.0-win64.zip`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe, en su lugar, un conjunto de subsistemas de un ejecutable de Windows: un núcleo externo en modo usuario con renderizado mediante Desktop Duplication, overlay externo a 144 Hz o más con sondeo a 342 Hz, radar 2D y filtro de objetos con sondeo a 227 Hz, suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad, y perfiles JSON intercambiables en caliente con 16 hilos de trabajo. Se menciona un consumo inferior a 26 MB de RAM y una tecla de pánico (`END`) para descarga segura del proceso.

No hay información sobre tokens de entrenamiento, composición de dataset, RLHF, DPO ni innovaciones en decodificación, atención o arquitectura de transformer, MoE o SSM. Cualquier dato de ese tipo sería inventado.

## Capacidades

- No es un modelo generativo: no produce texto, código, imágenes ni audio.
- Según la model card, el binario implementa un overlay externo con cajas delimitadoras 2D/3D, esqueletos de huesos y ESP de distancia.
- Incluye, siempre según la descripción del autor, un radar 2D con filtrado de objetos por rareza y seguimiento de contenedores.
- Dispone de suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad.
- Permite intercambio en caliente de perfiles JSON entre presets "Legit", "Visual" y "Custom".
- Tecla de pánico (`END`) para liberar handles y terminar el proceso.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking.
- La lista de idiomas de los metadatos (14 idiomas) no implica capacidades multilingües del binario; no hay evidencia de procesamiento de lenguaje natural.

## Casos de uso

No se identifican casos de uso legítimos de IA para este repositorio. Los escenarios que se describen a continuación reflejan lo que el autor declara que hace el binario, no recomendaciones de uso:

- Overlay de información en pantalla: el ejecutable dibujaría cajas delimitadoras y esqueletos sobre el juego mediante Desktop Duplication, sin inyectar DLL en el proceso objetivo.
- Radar de objetos: mostraría un mapa 2D con objetos filtrados por rareza y contenedores, actualizado a 227 Hz según la model card.
- Suavizado de apuntado: aplicaría curvas Bézier con radio de FOV y comprobación de visibilidad para modificar la entrada del ratón.
- Gestión de perfiles: permitiría cambiar entre presets JSON con una tecla, pensado para alternar configuraciones "Legit" y "Visual".
- Terminación rápida: la tecla `END` liberaría handles y cerraría el proceso para reducir la exposición.
- Distribución portable: el ZIP de 8,9 MB con contraseña fija (`2026`) está pensado para ejecutarse sin instalación en Windows x64.

Advertencia: en la mayoría de jurisdicciones y según los términos de servicio del videojuego, el uso de este tipo de software en partidas multijugador constituye trampa y puede acarrear el bloqueo permanente de la cuenta. Además, la ejecución de binarios de procedencia desconocida con privilegios de administrador y contraseña de archivo fija es un vector clásico de malware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el artefacto no es un modelo. Las únicas cifras declaradas por el autor son de rendimiento del supuesto binario (sondeo a 342 Hz y 227 Hz, menos de 26 MB de RAM, 16 hilos de trabajo), sin verificación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows de 64 bits (Windows 11 incluido), procesadores Intel y AMD x64.
- Espacio en disco: archivo ZIP de 8,9 MB; el tamaño descomprimido no se especifica.
- Memoria RAM declarada: inferior a 26 MB durante la ejecución.
- Opciones de despliegue: no aplica (no hay soporte de vLLM, llama.cpp, Ollama ni TGI). El autor indica ejecutar el `.exe` como administrador tras extraerlo con la contraseña `2026`.
- Latencia y throughput: no disponibles; las cifras de sondeo del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, ya que este repositorio no publica pesos ni arquitectura de aprendizaje automático. Frente a repositorios legítimos de modelos open source, las diferencias son categóricas: ausencia de pesos, ausencia de model card técnica real, ausencia de evaluación reproducible y presencia de un binario ejecutable con contraseña de descompresión.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de calidad, sesgo o alucinación propias de un LLM.
- Riesgo de seguridad elevado: distribución de un `.exe` de origen desconocido, con contraseña de ZIP fija (`2026`) que dificulta el escaneo automático y con instrucciones de ejecutarlo como administrador.
- Posible violación de los términos de servicio del videojuego Deadlock y de la legislación sobre trampas en juegos multijugador en diversas jurisdicciones.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del binario; la licencia cubre derechos de autor, no el cumplimiento de normas de terceros.
- Cero descargas y cero "likes" en el momento de la consulta, lo que sugiere un repositorio recién creado o de baja reputación.
- Los idiomas declarados en los metadatos no implican capacidades lingüísticas reales del artefacto.
- No hay evidencia de auditoría, firma de código ni trazabilidad del binario.
- En producción, cualquier integración con este repositorio debe descartarse; si se necesita un modelo de IA real, conviene acudir a repositorios con pesos verificables y model cards técnicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rodof4/deadlock-hack-script
- Repositorio de GitHub referenciado en la model card: https://github.com/porch-hedgerow/deadlock-hack-script
- Última release referenciada: https://github.com/porch-hedgerow/deadlock-hack-script/releases/latest
- Descarga directa citada por el autor (no recomendada): https://github.com/porch-hedgerow/deadlock-hack-script/releases/latest/download/deadlock-hack-script-v1.2.0-win64.zip
