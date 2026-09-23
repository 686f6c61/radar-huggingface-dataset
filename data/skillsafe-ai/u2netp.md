# skillsafe-ai/u2netp

## Resumen

`skillsafe-ai/u2netp` es un artefacto ONNX del modelo U²-Net-p, una red convolucional para eliminación de fondo (saliency/matting) distribuida por SkillSafe como fichero listo para ejecutarse en el navegador. No es un modelo de lenguaje: no genera texto, no razona y no acepta prompts. Su única función es recibir una imagen RGB normalizada de 320×320 píxeles y devolver siete mapas de máscara de primer plano de 1×320×320, que se combinan para separar el sujeto del fondo.

Se trata de una importación reproducible, no de un reentrenamiento: los pesos proceden del repositorio `tomjackson2023/rembg` (commit `cd3a3d6767a7859efea31ef0f2f373582cf06d82`) y se publican sin conversión, verificado cada byte por SHA-256. El paquete incluye la receta de conversión (`recipes/u2netp.yaml`) y un `manifest.json` con la cadena de herramientas exacta (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0), lo que permite auditar el origen y repetir la generación del artefacto.

Su relevancia es de tipo práctico: con 4,36 MB de pesos y una entrada fija de 320×320, cabe en cualquier dispositivo y puede ejecutarse íntegramente en el cliente mediante `onnxruntime-web` con WebGPU o WASM, sin enviar imágenes a un servidor. Eso habilita edición de fotos, fondos virtuales y preprocesado de visión con privacidad por diseño y coste de inferencia nulo en la nube. U²-Net-p es la variante ligera de la arquitectura U²-Net de Xuebin Qin et al., publicada bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U²-Net-p (red convolucional con estructura U anidada de dos niveles, variante ligera "p" de U²-Net) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 1×3×320×320 píxeles) |
| Tipos de cuantizacion | no disponible en el repositorio; el artefacto distribuido es float32. onnxruntime permite aplicar cuantización dinámica a posteriori, pero no se publica ninguna variante cuantizada |
| Idiomas soportados | no aplica (modelo de imagen, sin entrada ni salida de texto) |
| Licencia | apache-2.0 (pesos U²-Net-p: Apache-2.0, Xuebin Qin et al.; ONNX distribuido por rembg: MIT) |
| Formato de pesos | ONNX (`u2netp.onnx`, opset 11, 4,36 MB, SHA-256 `309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8`) |
| Contrato de entrada | `input.1` float32 `[1, 3, 320, 320]` |
| Contrato de salida | 7 tensores float32 `[1, 1, 320, 320]`: nombres `1959`, `1960`, `1961`, `1962`, `1963`, `1964`, `1965` |
| Modelo base declarado | tomjackson2023/rembg |
| Descargas / likes en el momento de la consulta | 0 / 0 |
| Tamano declarado del repo | 0,0 GB (metadato de HuggingFace; el fichero real ocupa 4,36 MB) |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

U²-Net-p pertenece a la familia de redes de detección de objetos sobresalientes con estructura U anidada: bloques residuales tipo RSU apilados en dos niveles jerárquicos, con supervisión en varias profundidades y fusión de los mapas intermedios para producir una máscara binaria de primer plano. La variante "-p" es la versión reducida de la arquitectura, pensada para inferencia en dispositivos modestos; de ahí su uso habitual como modelo por defecto en herramientas de recorte automático como rembg. La model card confirma la firma del grafo exportado: una única entrada de imagen y siete salidas a resolución completa, coherente con los mapas laterales (d0–d6) de la implementación original. La model card no especifica cuál de las siete salidas debe interpretarse como máscara final.

No hay información en el material proporcionado sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, el régimen de supervisión ni si hubo ajuste posterior con RLHF o DPO (extremo este último que, además, no aplica a un modelo de segmentación). Este repositorio no entrena nada: importa los pesos publicados por `tomjackson2023/rembg` sin conversión, los fija por hash y valida el resultado con `onnx.checker` y una ejecución en CPU con entradas a cero. La cadena completa (receta, fuentes, `uv.lock` y números de verificación por fichero) queda registrada en el `manifest.json` del propio repositorio.

## Capacidades

- Eliminación de fondo y segmentación de primer plano a partir de una imagen RGB de 320×320, con salida de siete mapas de máscara de la misma resolución.
- Ejecución íntegra en el navegador mediante `onnxruntime-web`, con proveedores de ejecución WebGPU y WASM.
- Ejecución en servidor o en local mediante onnxruntime estándar, sin dependencia de GPU.
- Verificación de integridad reproducible: cada fichero está anclado por SHA-256 a su origen y validado con `onnx.checker`.
- Ejecución en el cliente sin envío de datos a terceros, adecuada para flujos con requisitos de privacidad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta generación de texto, código ni matemáticas.
- No dispone de modo "thinking", ni de visión descriptiva (no etiqueta, no describe, no responde preguntas sobre la imagen).
- No soporta audio ni vídeo de forma nativa; cualquier uso sobre vídeo exige invocar el modelo fotograma a fotograma.
- Capacidades multilingües: no aplica.

## Casos de uso

- Edición de fotos en el navegador: el usuario carga una imagen, se redimensiona a 320×320, se infiere con WebGPU o WASM y se aplica la máscara para sustituir el fondo, todo sin subir el archivo a ningún servidor. Es el escenario para el que el repositorio está explícitamente preparado.
- Fondos virtuales y difuminado en videollamadas o webapps de captura de cámara: la máscara generada por fotograma permite separar al hablante del entorno. Con 104,1 ms por inferencia en CPU (medición del propio repositorio) el margen para tiempo real es ajustado; en WebGPU la cifra mejora, aunque no se publica un dato de throughput.
- Fichas de producto en comercio electrónico: recorte automático del sujeto sobre fondo blanco o transparente para catálogos, generando PNG con canal alfa a partir de la máscara.
- Herramientas internas con privacidad por diseño: aplicaciones de escritorio o PWA que procesan imágenes sensibles (documentos de identidad, fotografías médicas, material de RRHH) sin salida de red, ya que el modelo cabe en 4,36 MB y no requiere backend.
- Extensiones de navegador y aplicaciones offline: al ser un único fichero ONNX de 4,36 MB, se puede empaquetar dentro de la extensión o cachear con la Cache API para funcionar sin conexión.
- Preprocesado en pipelines de visión por computador: generación de máscaras de primer plano para alimentar etapas posteriores (clasificación, reencuadre automático, aumentado de datos, generación de recortes para etiquetado).
- Prototipado y sustitución de APIs de recorte de pago en fases tempranas: permite validar un flujo de producto con coste de inferencia nulo en la nube antes de decidir si se necesita un modelo de mayor calidad en los bordes.
- Generación de máscaras para conjuntos de datos de entrenamiento o fine-tuning de modelos de matting de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (S-measure, MAE, IoU, F-measure) ni comparaciones con otros modelos. El único dato cuantitativo aportado es una comprobación de humo (no un benchmark de calidad):

| Prueba | Entrada | Salida | Tiempo |
|---|---|---|---|
| Smoke run en CPU con onnxruntime 1.30.0 (Darwin 25.6.0 arm64, entradas a cero) | `input.1` [1, 3, 320, 320] | 7 tensores [1, 1, 320, 320] | 104,1 ms |

Este número corresponde a una ejecución de validación con tensores rellenos de ceros en un equipo concreto y no debe interpretarse como latencia representativa de producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del artefacto (4,36 MB) y la resolución fija de entrada (320×320), la huella de memoria es reducida y no depende de una GPU.
- GPU recomendadas: no se especifica ninguna. El modelo funciona en CPU; para aceleración se puede usar cualquier proveedor de ejecución de onnxruntime (WebGPU en navegador, CUDA o TensorRT en servidor), pero la model card solo documenta `webgpu` y `wasm`.
- GPU de consumo: cabe en cualquier GPU de consumo, e incluso prescinde de ella. El ejemplo de uso publicado apunta a WebGPU del navegador o a CPU vía WASM.
- CPU: totalmente soportado; es el modo en el que el propio repositorio verifica el modelo (104,1 ms por inferencia en la máquina de conversión).
- Opciones de despliegue: `onnxruntime-web` (JavaScript, proveedores WebGPU y WASM), onnxruntime en Python, C++, C# o Java, y cualquier runtime compatible con ONNX opset 11. No aplica vLLM, llama.cpp, Ollama ni TGI, por tratarse de un modelo de visión y no de un modelo de lenguaje.
- Latencia y throughput: se conoce la latencia puntual de la prueba de humo (104,1 ms en CPU, entradas a cero). El throughput sostenido y la latencia con imágenes reales no están disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de alternativas, por lo que la comparación se limita a lo verificable en este repositorio.

| Modelo | Tipo | Contexto/entrada | Licencia | Formato | Datos disponibles |
|---|---|---|---|---|---|
| skillsafe-ai/u2netp | U²-Net-p (CNN, estructura U anidada ligera) | 1×3×320×320 | Apache-2.0 | ONNX, 4,36 MB | Ficha completa en este documento |
| tomjackson2023/rembg (modelo base) | Contenedor/paquete de modelos de recorte | no disponible | no disponible | no disponible | Solo se conoce el commit de origen |
| U²-Net completo (xuebinqin/U-2-Net) | U²-Net (variante de mayor tamaño) | no disponible | Apache-2.0 | no disponible en la información aportada | Enlace al repositorio original; sin cifras confirmadas aquí |
| Otras alternativas de matting (ISNet, MODNet, RMBG) | no disponible | no disponible | no disponible | no disponible | No mencionadas en la información proporcionada |

No se dispone de datos de rendimiento comparado, por lo que no es posible establecer una jerarquía de calidad entre estas opciones.

## Limitaciones y advertencias

- Resolución de trabajo baja: toda imagen se reduce a 320×320 antes de la inferencia, lo que degrada bordes finos (pelo, ramas, encajes, tejidos transparentes) y detalles de sujetos pequeños en imágenes grandes.
- No apta para matting de alta precisión ni para conservar semitransparencias; para eso se necesitan modelos de matting específicos de mayor tamaño.
- La model card no indica cuál de las siete salidas debe usarse como máscara final ni cómo combinarlas, lo que deja margen a implementaciones inconsistentes.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existen falsos positivos y negativos de segmentación (fondo retenido o zonas del sujeto recortadas) que pueden ser difíciles de predecir.
- Sesgos: no se documenta la composición del dataset de entrenamiento original, por lo que se desconoce el sesgo respecto a tipos de sujetos, tonos de piel, iluminación o categorías de objeto.
- Trazabilidad de licencia: aunque la licencia declarada es Apache-2.0, los pesos derivan de U²-Net (Apache-2.0, Xuebin Qin et al.) y el ONNX de rembg (MIT). Es obligatorio mantener la atribución indicada en la model card y en el fichero de licencia del proyecto original.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria externa ni resultados de benchmarks publicados.
- Inconsistencia de metadatos: HuggingFace declara un tamaño de repositorio de 0,0 GB mientras que el artefacto listado ocupa 4,36 MB; conviene verificar los ficheros reales antes de integrarlos.
- Etiqueta `base_model:quantized:tomjackson2023/rembg` presente en los tags, pero no se publica ningún fichero cuantizado en este repositorio; el único artefacto es float32.
- Para vídeo en tiempo real, la latencia publicada en CPU (104,1 ms por fotograma) no alcanza tasas fluidas; habría que apoyarse en WebGPU o en un runtime nativo con aceleración.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/u2netp
- Fichero del modelo: https://huggingface.co/skillsafe-ai/u2netp/resolve/main/u2netp.onnx
- Modelo base (upstream): https://huggingface.co/tomjackson2023/rembg/tree/cd3a3d6767a7859efea31ef0f2f373582cf06d82
- Repositorio de conversión (SkillSafe, carpeta `models/`): https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- U²-Net original (Xuebin Qin et al.): https://github.com/xuebinqin/U-2-Net
- Licencia de U²-Net: https://github.com/xuebinqin/U-2-Net/blob/master/LICENSE
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Nota sobre la búsqueda web: los resultados proporcionados (páginas de forumpa.it sobre la Agencia Tributaria italiana y perfiles de relatores) no guardan relación con este modelo y no aportan enlaces utilizables. No se dispone de paper, blog o demo adicionales vinculados a esta publicación concreta.
