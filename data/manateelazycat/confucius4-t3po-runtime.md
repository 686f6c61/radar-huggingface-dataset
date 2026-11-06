# manateelazycat/Confucius4-T3PO-Runtime

## Resumen

Confucius4-T3PO-Runtime es un repositorio de artefactos de despliegue (archivos Docker cargables con `docker load`) para ejecutar el modelo Confucius4-T3PO en dispositivos NVIDIA Jetson AGX Orin y AGX Thor. Lo publica el usuario manateelazycat bajo el paraguas del proyecto "lazycat" y está etiquetado como `inference-runtime`, no como un modelo de pesos. El repositorio pesa 9,0 GB y contiene código de inferencia y dependencias (PyTorch, Transformers) empaquetadas para la versión 0.1.7 del LPK de AI Pod.

El punto clave es que este repositorio no incluye los pesos del modelo: la model card indica explícitamente que los pesos deben descargarse por separado desde `netease-youdao/Confucius4-T3PO`. Por tanto, el runtime actúa como capa de empaquetado y compatibilidad para hardware Jetson, con dos variantes no intercambiables entre sí (Thor usa runtime 0.1.5; Orin usa runtime 0.1.4).

Su relevancia es operativa: facilita el despliegue reproducible de un modelo de gran tamaño en plataformas edge de NVIDIA, con verificación de integridad mediante `checksums.json` (tamaño y SHA256) antes de la carga de la imagen. No se dispone de información sobre arquitectura, parámetros o contexto del modelo subyacente en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un runtime de inferencia, no un modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (código del proyecto Apache-2.0 según LICENSE; cada componente mantiene su propia licencia) |
| Formato de pesos | no disponible (el repositorio contiene imágenes Docker, no pesos; los pesos se descargan de netease-youdao/Confucius4-T3PO) |

## Arquitectura y entrenamiento

No disponible. La información proporcionada no describe la arquitectura del modelo Confucius4-T3PO ni sus datos de entrenamiento. El repositorio en cuestión es un runtime de inferencia: contiene código de inferencia y dependencias (PyTorch y Transformers) empaquetadas en archivos Docker para AGX Orin y AGX Thor, publicados para AI Pod LPK 0.1.7.

La única información técnica relevante es de empaquetado y compatibilidad: existen dos archivos específicos por dispositivo que no son intercambiables, con versiones de runtime distintas (0.1.5 para Thor, 0.1.4 para Orin), y se recomienda verificar tamaño y SHA256 desde `checksums.json` antes de ejecutar `docker load`, así como verificar la identidad de la imagen tras la carga.

## Capacidades

- Despliegue de inferencia en NVIDIA Jetson AGX Orin y AGX Thor mediante imágenes Docker cargables.
- Inclusión de dependencias de ejecución (PyTorch, Transformers) en el propio archivo, lo que reduce la necesidad de configurar el entorno manualmente.
- Verificación de integridad de artefactos mediante `checksums.json` (tamaño y SHA256).
- Separación entre runtime y pesos: permite actualizar o sustituir los pesos sin cambiar la imagen de ejecución.
- No se dispone de información sobre capacidades del modelo subyacente (generación de texto, razonamiento, código, tool calling, agentes, multilingüismo, visión o audio).

## Casos de uso

- Despliegue en edge con Jetson AGX Orin: cargar la imagen correspondiente al runtime 0.1.4 en un dispositivo Orin y descargar los pesos de Confucius4-T3PO por separado para ejecutar inferencia local sin depender de la nube.
- Despliegue en edge con Jetson AGX Thor: usar la imagen del runtime 0.1.5, específica para Thor, evitando mezclar artefactos entre plataformas dado que no son intercambiables.
- Integración en AI Pod LPK 0.1.7: incorporar el runtime como componente estándar dentro del pipeline de aprovisionamiento del LPK, de modo que el equipo de plataforma gestione versiones de forma centralizada.
- Verificación de cadena de suministro: automatizar la comprobación de tamaño y SHA256 desde `checksums.json` antes de `docker load` en un pipeline de CI/CD, y validar la identidad de la imagen tras la carga.
- Reproducibilidad en laboratorio: fijar la versión del runtime por dispositivo para garantizar que las pruebas de evaluación del modelo se ejecutan sobre un entorno idéntico entre ejecuciones.
- Actualización controlada de pesos: mantener la imagen de runtime estable y sustituir únicamente los pesos descargados desde `netease-youdao/Confucius4-T3PO`, reduciendo el tamaño de las actualizaciones en dispositivos con conectividad limitada.
- Distribución a flotas de dispositivos: servir los archivos Docker desde un registro interno y desplegarlos en múltiples Jetson con un procedimiento homogéneo de carga y verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NVIDIA Jetson AGX Orin (runtime 0.1.4) y NVIDIA Jetson AGX Thor (runtime 0.1.5). No se indica compatibilidad con otras plataformas.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: exclusivamente las plataformas Jetson indicadas; no se mencionan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible (el destino son módulos Jetson, no GPU de escritorio).
- Opciones de despliegue: Docker (`docker load`) sobre AI Pod LPK 0.1.7; el runtime incluye PyTorch y Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 9,0 GB, por lo que se requiere espacio suficiente para el archivo Docker y para los pesos descargados por separado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento del modelo subyacente que permitan una comparación con alternativas.

## Limitaciones y advertencias

- Este repositorio no contiene pesos del modelo; sin la descarga separada desde `netease-youdao/Confucius4-T3PO` el runtime no es funcional por sí solo.
- Los archivos son específicos por dispositivo y no intercambiables: usar la imagen de Thor en Orin (o viceversa) no está soportado.
- Las versiones de runtime difieren entre plataformas (0.1.5 en Thor, 0.1.4 en Orin), lo que complica mantener paridad de comportamiento entre dispositivos.
- La licencia es "other": el código del proyecto es Apache-2.0, pero cada componente conserva su propia licencia. Es necesario revisar las licencias de PyTorch, Transformers y del modelo para uso comercial.
- No se especifican idiomas soportados, sesgos, tasas de alucinación ni limitaciones de contexto del modelo subyacente.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado; no hay evidencia pública de validación por terceros.
- Se debe verificar tamaño y SHA256 antes de `docker load` y confirmar la identidad de la imagen después; omitir este paso expone a cargar artefactos corruptos o manipulados.
- No se documentan requisitos de memoria, latencia ni throughput, lo que impide dimensionar despliegues en producción sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manateelazycat/Confucius4-T3PO-Runtime
- Pesos del modelo (referenciado en la model card): https://huggingface.co/netease-youdao/Confucius4-T3PO
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
