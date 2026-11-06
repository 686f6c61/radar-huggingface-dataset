# AbrahamPJ/nightmare-qnn-251

## Resumen

`AbrahamPJ/nightmare-qnn-251` no es un modelo de lenguaje en el sentido habitual, sino un repositorio de distribución de las bibliotecas del runtime HTP (Hexagon Tensor Processor) de Qualcomm AI Runtime (QAIRT), extraídas sin modificar de la release pública 2.51.0.260929 de la comunidad QAIRT. El autor, AbrahamPJ, lo publica como artefacto auxiliar de su aplicación Nightmare Mobile, que descarga en tiempo de ejecución los binarios compartidos (`libQnnHtp.so`, `libQnnSystem.so`) y el trío específico de la arquitectura NPU del dispositivo (`libQnnHtpV<arch>.so`, `...Stub.so` y `...Skel.so`, cubriendo de v68 a v85), verificando cada fichero contra su hash SHA-256 en lugar de empaquetar en el APK los binarios de todos los chips compatibles.

El propósito es, por tanto, de ingeniería de despliegue: reducir el tamaño del paquete Android y servir los binarios correctos según el SoC del teléfono, manteniendo la integridad mediante comprobación criptográfica. No hay pesos neuronales, tokenizador, configuración de transformer ni datos de entrenamiento asociados al repositorio; el tamaño de 0,2 GB corresponde a las bibliotecas nativas precompiladas para las distintas arquitecturas Hexagon.

Dado que no existe un modelo entrenado ni parámetros que evaluar, esta ficha documenta el artefacto tal como se publica, señalando explícitamente qué campos de la estructura habitual de una ficha de modelo no son aplicables o no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; conjunto de bibliotecas nativas del runtime QNN HTP de Qualcomm) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (el runtime soporta los formatos que defina QNN; no se especifican en la model card) |
| Idiomas soportados | no disponible |
| Licencia | `other`, con `license_name: qualcomm-ai-runtime` (términos de Qualcomm) |
| Formato de pesos | no disponible; los artefactos son bibliotecas compartidas `.so` (`libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV<arch>.so`, `...Stub.so`, `...Skel.so`) |
| Version del runtime | QAIRT 2.51.0.260929 |
| Arquitecturas NPU cubiertas | Hexagon v68 a v85 |
| Verificacion de integridad | SHA-256 por fichero |
| Tamano del repositorio | 0,2 GB |
| Region declarada | `us` |

## Arquitectura y entrenamiento

No aplica en el sentido de un modelo entrenado: el repositorio contiene binarios compilados del stack QNN HTP de Qualcomm, que es el backend de ejecución para acelerar inferencia en la NPU Hexagon de los SoC Snapdragon. La organización por pares y tríos de bibliotecas (`libQnnHtp.so` + `libQnnSystem.so` como base compartida, y `libQnnHtpV<arch>.so` con sus variantes `Stub` y `Skel` por arquitectura) refleja el modelo de carga dinámica de QNN: el stub actúa como interfaz en espacio de usuario y el skel se ejecuta en el DSP.

No hay información sobre datos de entrenamiento, composición del dataset, ajuste fino, RLHF o DPO, porque no existe un proceso de entrenamiento asociado. La única "innovación" documentada es operativa: la descarga selectiva por arquitectura con verificación SHA-256, que evita incluir en el APK los binarios de todas las variantes de chip.

## Capacidades

- Distribución selectiva de bibliotecas QNN HTP por arquitectura de NPU Hexagon (v68 a v85).
- Verificación de integridad de cada binario mediante SHA-256 antes de su uso.
- Descarga en tiempo de ejecución de los binarios compartidos y del trío específico del dispositivo.
- Reducción del tamaño del APK al no empaquetar los binarios de todos los SoC.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo.
- No tiene capacidades multilingües propias.
- Habilita, como dependencia, la ejecución de modelos cuantizados sobre la NPU Hexagon a través del runtime QNN en aplicaciones Android.

## Casos de uso

- Aplicación Android con inferencia en NPU: Nightmare Mobile usa este repositorio para obtener en tiempo de ejecución las bibliotecas QNN HTP adecuadas al SoC del usuario, evitando distribuir un APK con binarios de todas las arquitecturas.
- Distribución de binarios nativos por variante de hardware: el patrón de descarga selectiva con verificación SHA-256 es reutilizable en cualquier app que necesite artefactos nativos específicos por chip.
- Reducción del tamaño de paquete: al no incluir los binarios de todas las variantes Hexagon (v68 a v85), el APK disminuye de forma significativa frente al empaquetado completo.
- Integración de aceleración por NPU en pipelines de inferencia on-device: sirve como dependencia para ejecutar modelos cuantizados con QNN en dispositivos Snapdragon compatibles.
- Verificación de integridad en cadena de suministro: el chequeo SHA-256 por fichero permite detectar binarios corruptos o manipulados antes de cargarlos.
- Actualización controlada del runtime: al fijar la versión QAIRT 2.51.0.260929, se puede reproducir el entorno de ejecución exacto entre builds y dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable; cualquier métrica de latencia o throughput dependerá del modelo concreto que se ejecute sobre QNN HTP y del SoC del dispositivo, y no se documenta en la model card.

## Requisitos de hardware

- No aplica VRAM de GPU: los binarios están destinados a la NPU Hexagon integrada en SoC Qualcomm Snapdragon.
- Arquitecturas Hexagon soportadas: v68 a v85, según la model card.
- No requiere GPU dedicada (A100, H100, RTX 4090) ni cabe esperar ejecución en ellas con este runtime.
- Despliegue: integración en aplicaciones Android mediante las bibliotecas QNN HTP; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del modelo y del SoC.
- Almacenamiento: el repositorio ocupa 0,2 GB, aunque la app descarga solo el par compartido y el trío correspondiente a su arquitectura.

## Comparativa con modelos similares

| Artefacto | Tipo | Cobertura de hardware | Verificacion de integridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AbrahamPJ/nightmare-qnn-251` | Bibliotecas QNN HTP (QAIRT 2.51.0.260929) | Hexagon v68 a v85 | SHA-256 por fichero | `other` (qualcomm-ai-runtime) | Hugging Face, 0 descargas, 0 likes |
| QAIRT oficial (Qualcomm AI Runtime Community) | Runtime completo | Según release oficial | No documentado en la model card | Términos de Qualcomm | Canal oficial de Qualcomm |
| Empaquetado completo en APK | Bibliotecas QNN HTP embebidas | Todas las variantes incluidas | No aplica (van en el paquete) | Términos de Qualcomm | Distribución vía tienda de aplicaciones |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni realiza inferencia por sí mismo; es una dependencia de ejecución.
- La licencia es `other` con términos de Qualcomm (`qualcomm-ai-runtime`); el uso comercial y la redistribución están sujetos a dichos términos, que no se detallan en la model card.
- El autor indica explícitamente que los ficheros son de Qualcomm y se rigen por su licencia; conviene revisar los términos originales antes de redistribuirlos.
- Solo cubre arquitecturas Hexagon v68 a v85; dispositivos con NPU fuera de ese rango no están soportados por este paquete.
- Depende de la versión QAIRT 2.51.0.260929; mezclar binarios de otras versiones puede provocar incompatibilidades ABI.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-10-31), por lo que no hay evidencia de uso en producción ni validación externa.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque no hay modelo lingüístico; esos riesgos dependerán del modelo que se ejecute sobre el runtime.
- La descarga en tiempo de ejecución introduce una dependencia de red y de disponibilidad del repositorio; la verificación SHA-256 mitiga la corrupción, pero no garantiza la disponibilidad del origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AbrahamPJ/nightmare-qnn-251
- Qualcomm AI Runtime Community (origen de los binarios QAIRT 2.51.0.260929): no se proporciona URL en la información disponible.
- Documentación de QNN / QAIRT: no se proporciona URL en la información disponible.
- Aplicación Nightmare Mobile: no se proporciona URL en la información disponible.
