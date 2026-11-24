# genome-spy/CATv1-WebGPU

## Resumen

CATv1-WebGPU es un repositorio de pesos del modelo CATv1 (Cherimoya) reempaquetados para su ejecución en navegador mediante el motor WebGPU `cherimoya-wgsl@1` del proyecto GenomeSpy. CATv1 es un modelo de secuencia-a-función genómica desarrollado por Jacob Schreiber y el Programmable Genomics Laboratory (UMass Chan Medical School), entrenado sobre datos del proyecto ENCODE para predecir señales de accesibilidad de cromatina a partir de secuencias de ADN. Este repositorio no contiene un modelo nuevo ni un fine-tuning: son dos checkpoints preentrenados originales (ENCSR000ELW en A549 y ENCSR000EME en BJ, ambos ensayos DNase-seq) reempaquetados en formato binario propio sin cuantización ni modificación de los valores fp32.

La relevancia de este artefacto es de infraestructura más que de modelado: demuestra la viabilidad de ejecutar inferencia genómica real en un navegador con WebGPU, validada numéricamente contra PyTorch nativo en CPU con tolerancias `atol=1e-5` y `rtol=2e-4`. Se trata de un piloto de dos checkpoints, no del atlas completo de CATv1, y el repositorio distribuye únicamente pesos y metadatos, no una librería de inferencia pública ni código de shaders.

El modelo subyacente es una red convolucional dilatada de 128 canales con nueve bloques dilatados, factor de expansión dos y normalización de población global por ejemplo, que produce un perfil de 1.000 posiciones y un logaritmo de conteo total. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.0 GB reportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con nueve bloques dilatados, 128 canales, expansion 2, normalizacion de poblacion global por ejemplo (epsilon 0.001), residual scale 0.15 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Entrada `[1, 4, 2114]` (4 canales ACGT, 2114 posiciones); salida sobre la ventana central `[557, 1557)` del input |
| Tipos de cuantizacion | Ninguna; pesos fp32 originales sin cuantizar |
| Idiomas soportados | no aplica (modelo de secuencia genomica, no linguistico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Contenedor binario propio `.bin` (cabecera `GSCATv1\n`, longitud JSON uint32 little-endian, JSON UTF-8 alineado a 4 bytes, tensores fp32 little-endian contiguos); no es ONNX |
| Modelo base | programmable-genomics/CATv1 (revision `dfdd7b6b0a9b20bd59427337e4244056b128bda9`) |
| Tensores de inferencia | 33 por checkpoint |
| Checkpoints incluidos | ENCSR000ELW (A549, DNase-seq), ENCSR000EME (BJ, DNase-seq) |
| Entrada | ACGT canonico, fp32, forma `[1, 4, 2114]` |
| Salida | Logits de perfil `[1, 1, 1000]` y log counts `[1, 1]` |

## Arquitectura y entrenamiento

El modelo base CATv1 es una red neuronal convolucional con nueve bloques dilatados y 128 canales por capa, con factor de expansión dos y un residual scale de 0.15. Aplica normalización de población global por ejemplo con epsilon 0.001. La entrada es una secuencia de ADN codificada en cuatro canales (A, C, G, T) de 2.114 posiciones, y la salida consta de dos cabezas: un perfil de 1.000 posiciones (logits crudos) y un logaritmo del conteo total de lecturas. La predicción de conteos esperados se obtiene aplicando un softmax sobre las 1.000 posiciones del perfil y multiplicándolo por `max(expm1(log_counts), 0)`, sin reescalado oculto ni promediado de hebras.

Este repositorio concreto no entrena ni ajusta nada: toma dos checkpoints preentrenados de CATv1 y los reempaqueta en un contenedor binario content-addressed. Cada archivo `.bin` incluye metadatos y los 33 tensores de inferencia; se omiten los pesos de incertidumbre (loss-only) por no participar en inferencia. El hash SHA-256 del pack vincula metadatos y bytes de pesos, y los hashes individuales de tensores junto con las identidades exactas de los checkpoints originales se conservan en la cabecera y en los `metadata.json` por checkpoint. No hay datos publicados sobre el número de tokens de entrenamiento ni sobre la composición del dataset más allá de la procedencia ENCODE.

La innovación técnica destacable no está en el modelo sino en el runtime: la ejecución se realiza en WebGPU mediante el motor `cherimoya-wgsl@1`, con 57 dispatches GPU reales observados por predicción. La validación comparó inferencia nativa PyTorch en CPU contra WebGPU en navegador headless real en los loci GATA2 y HBG1, verificando las 1.000 posiciones genómicas sometidas.

## Capacidades

- Predicción de señal de accesibilidad de cromatina (DNase-seq) a partir de secuencia de ADN en formato ACGT.
- Salida de perfil de señal en 1.000 posiciones genómicas con coordenadas zero-based half-open sobre la ventana central `[557, 1557)` del input.
- Predicción de conteo total de lecturas esperado por ejemplo.
- Ejecución de inferencia en navegador mediante WebGPU, con validación numérica frente a PyTorch nativo.
- Compatibilidad con el flujo "This browser (WebGPU) -> Predict signal" de GenomeSpy Sequence Designer.
- Conmutación entre modelos WGSL y ONNX dentro de la aplicación, con recuperación ante pérdida de dispositivo y restauración en frío.
- No soporta: entrenamiento, grafo backward, diferenciación automática, Ledidi, DeepLIFT, PISA, ensembles ni indels.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Exploración interactiva de variantes en navegador: un investigador puede cargar un pack `.bin` en GenomeSpy Sequence Designer y predecir la señal DNase-seq de una región concreta sin salir del navegador, útil para triaje rápido antes de lanzar trabajos nativos más costosos.
- Docencia y demostraciones de genómica computacional: al ejecutarse en WebGPU sobre hardware de consumo, permite mostrar en clase cómo un modelo de secuencia-a-función transforma una secuencia de 2.114 pb en un perfil de accesibilidad sin infraestructura de servidor.
- Validación cruzada de pipelines: los packs incluyen hashes por tensor e identidad de checkpoint, lo que permite verificar que una implementación propia reproduce exactamente los pesos originales antes de integrarla en un pipeline de producción.
- Prototipado de visores genómicos: desarrolladores de herramientas como GenomeSpy pueden integrar predicción de señal bajo demanda en la interfaz, aprovechando la conmutación entre backends WGSL y ONNX ya ejercitada en la app.
- Auditoría de reproducibilidad: el manifiesto `manifest.json`, `SHA256SUMS` y `validation-summary.json` permiten reconstruir y comprobar numéricamente una predicción concreta en una configuración de hardware documentada (Apple Metal), como evidencia para revisión por pares.
- Evaluación de despliegue edge para genómica: sirve como banco de pruebas para medir si WebGPU en un portátil es suficiente para inferencia de modelos de secuencia-a-función en escenarios donde no se puede enviar ADN a un servidor externo.
- Integración en flujos de anotación de variantes a pequeña escala: para regiones concretas y con la cautela de que la fiabilidad de signos de efecto en variantes muy pequeñas no está garantizada, puede orientar qué loci merecen análisis con herramientas nativas más completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta validación numérica de equivalencia: inferencia nativa PyTorch en CPU frente a WebGPU en navegador headless real, en los loci GATA2 y HBG1, con todos los valores de logits de perfil, log counts y señal decodificada dentro de `atol=1e-5, rtol=2e-4`, cubriendo las 1.000 posiciones genómicas sometidas. Se observaron 57 dispatches GPU reales por predicción. No se aportan métricas de precisión biológica (AUROC, correlación con señal experimental) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos son fp32 y el repositorio reporta 0.0 GB de tamaño, por lo que la huella es reducida, pero no se publica una cifra exacta.
- GPU recomendadas: la validación se realizó en una configuración Apple Metal; no se especifica el modelo de GPU concreto.
- Compatibilidad con GPU de consumo: requiere un navegador con soporte WebGPU; el piloto se validó en una única configuración Apple Metal, no en todas las familias de dispositivo.
- Opciones de despliegue: motor `cherimoya-wgsl@1` dentro de GenomeSpy Sequence Designer, instalando los `.bin` en `.cache/catalogue/wgsl/` y reiniciando el host. No hay librería JavaScript pública ni demo ejecutable publicada. Los packs no son compatibles con ONNX Runtime; las exportaciones ONNX de CATv1 son un repositorio separado. La ejecución nativa MPS usa los pesos PyTorch originales.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se hace ninguna afirmación de rendimiento universal y que los tiempos de cómputo y los de la aplicación completa tienen alcances distintos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| genome-spy/CATv1-WebGPU | no disponible | `[1, 4, 2114]` | `.bin` propio (WebGPU) | cc-by-4.0 | Pesos y metadatos; sin librería pública ni demo |
| programmable-genomics/CATv1 | no disponible | no disponible | PyTorch nativo | no disponible en la informacion | Repositorio original en Hugging Face |
| genome-spy/CATv1-ONNX | no disponible | no disponible | ONNX | no disponible en la informacion | Exportación ONNX separada, sin cambios |

No se dispone de datos de benchmarks ni de parámetros totales para establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría. La comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un piloto de dos checkpoints, no el atlas completo de CATv1; no cubre todos los folds ni todos los ensayos.
- La validación se realizó en una única configuración de GPU Apple Metal; no constituye cualificación para todos los dispositivos, todos los folds ni aplicaciones PWA instaladas.
- Solo está habilitado el método de predicción: no hay grafo backward, diferenciación automática, Ledidi, DeepLIFT, PISA, entrenamiento, ensembles ni indels.
- Superar las puertas de error absoluto y relativo no garantiza que los signos de efecto de variantes arbitrariamente pequeñas sean fiables.
- El repositorio distribuye pesos y metadatos, no una librería de inferencia JavaScript independiente ni el código de los shaders; ejecutarlo requiere una implementación compatible de `cherimoya-wgsl@1`.
- La procedencia del kernel apunta a un repositorio privado de GenomeSpy que requiere acceso de organización y no concede licencia de software.
- No hay proveedor de inferencia alojado ni demo ejecutable pública incluida.
- El flujo completo no es offline: el host sigue preparando el ADN de referencia y conservando entradas y resultados, aunque la ejecución GPU ocurra en el navegador.
- Los packs no son archivos ONNX y no pueden pasarse a ONNX Runtime.
- La entrada aceptada actualmente es ACGT canónico en fp32; no se documenta soporte de bases ambiguas.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero debe revisarse la atribución requerida a los autores originales (Jacob Schreiber y Programmable Genomics Laboratory, UMass Chan Medical School) y al proyecto ENCODE.
- No se publican métricas de precisión biológica ni evaluación de sesgos; el riesgo de alucinación en sentido lingüístico no aplica, pero sí el riesgo de predicciones numéricamente válidas y biológicamente poco fiables fuera de las condiciones validadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/genome-spy/CATv1-WebGPU
- Modelo base CATv1: https://huggingface.co/programmable-genomics/CATv1
- Exportaciones ONNX de CATv1: https://huggingface.co/genome-spy/CATv1-ONNX
- Repositorio privado del kernel WebGPU Cherimoya: https://github.com/genome-spy/webgpu-cherimoya/tree/2629396a8665ccd156e6bc344b9b382f966261ce
