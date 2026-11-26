# NagisaNao/comfyui-encrypt-image

## Resumen

`NagisaNao/comfyui-encrypt-image` no es un modelo de IA, sino un plugin de nodos personalizados para ComfyUI que implementa cifrado de imágenes a nivel de píxel y de metadatos. Lo desarrolla el usuario NagisaNao y su propósito es proteger tanto el contenido visual de las imágenes generadas o subidas como los metadatos embebidos (prompts y workflows) sin alterar el flujo de trabajo habitual de ComfyUI. Es relevante para quienes despliegan ComfyUI en entornos compartidos o expuestos y necesitan evitar la fuga de parámetros de generación.

El cifrado se realiza mediante una permutación determinista de filas y columnas de píxeles derivada de una clave SHA-256 y aplicada con un barajado Fisher-Yates; la desencriptación aplica la permutación inversa exacta. Adicionalmente, los campos de metadatos PNG (`prompt`, `workflow`) se cifran con XOR contra la contraseña y se codifican en base64 antes de guardarse.

La integración es transparente: el plugin intercepta (monkey-patch) `Image.open()` e `Image.save()` de PIL y registra dos middlewares de aiohttp, uno para descifrar antes de servir al navegador y otro para cifrar tras la subida a `/input`. El repositorio tiene 0 GB de tamaño y 0 descargas en el momento de la consulta, por lo que se trata de un proyecto incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; plugin de ComfyUI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (plugin Python; imágenes cifradas en PNG con etiqueta `Encrypt: pixel_shuffle_3`) |

## Arquitectura y entrenamiento

No aplica entrenamiento: el componente no es un modelo neuronal. La arquitectura del plugin se compone de tres piezas. Primero, un cifrado de píxeles basado en permutación de filas y columnas con clave derivada por SHA-256 y barajado Fisher-Yates, reversible mediante la permutación inversa. Segundo, un cifrado de metadatos PNG (`prompt`, `workflow`) mediante XOR con la contraseña y codificación base64. Tercero, una capa de integración que monkey-patchea `Image.open()` e `Image.save()` de PIL y añade dos middlewares aiohttp para descifrar al servir y cifrar al subir a `/input`.

Los archivos cifrados se marcan con la etiqueta de metadatos PNG `Encrypt: pixel_shuffle_3` e incluyen un campo de verificación de contraseña SHA-256, lo que permite al plugin detectar archivos ya cifrados y omitir el proceso. No se documentan datos de entrenamiento, RLHF ni innovaciones de decodificación porque no procede.

## Capacidades

- Cifrado de píxeles de imágenes mediante permutación determinista de filas y columnas con clave SHA-256 y Fisher-Yates.
- Descifrado mediante aplicación de la permutación inversa exacta.
- Cifrado de metadatos PNG embebidos (`prompt`, `workflow`) con XOR contra contraseña y base64.
- Detección de archivos ya cifrados mediante la etiqueta `Encrypt: pixel_shuffle_3` y verificación SHA-256 de contraseña.
- Integración transparente con ComfyUI mediante monkey-patch de `Image.open()` e `Image.save()` de PIL.
- Middleware aiohttp de descifrado antes de servir imágenes al navegador.
- Middleware aiohttp de cifrado tras la subida de imágenes a la carpeta `/input`.
- No incluye generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Despliegue de ComfyUI en servidores compartidos: el plugin cifra automáticamente las imágenes generadas para que otros usuarios del host no puedan ver el contenido visual ni extraer los prompts del workflow.
- Protección de propiedad intelectual de prompts: al cifrar los campos `prompt` y `workflow` con XOR y base64, impide que terceros recuperen las cadenas de generación y los grafos de nodos a partir del PNG.
- Publicación de galerías en entornos controlados: el middleware aiohttp descifra al vuelo antes de servir al navegador, de modo que el usuario autorizado ve la imagen clara mientras el archivo en disco permanece cifrado.
- Flujos de subida segura: el middleware de cifrado tras la subida a `/input` asegura que las imágenes cargadas por el usuario queden cifradas en reposo sin pasos manuales.
- Cumplimiento de privacidad en estudios con imágenes sensibles: el cifrado en reposo de píxeles y metadatos reduce la exposición ante accesos no autorizados al almacenamiento.
- Integración en pipelines de CI/CD de ComfyUI: al no requerir cambios en los nodos existentes, se puede añadir a entornos de prueba y producción sin reescribir los workflows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el plugin no ejecuta inferencia ni carga pesos en GPU.
- GPU recomendadas: no aplica; el consumo de GPU lo determina el modelo que ejecute ComfyUI, no este plugin.
- Compatibilidad con GPU de consumo: no aplica por el mismo motivo.
- Opciones de despliegue: requiere ComfyUI con Python, PIL y aiohttp; se instala como nodo personalizado en el directorio de custom nodes.
- Latencia y throughput: no disponibles; el coste es el de la permutación de píxeles y el XOR de metadatos, proporcional al tamaño de la imagen, sin cifras publicadas.

## Comparativa con modelos similares

| Proyecto | Tipo | Cifrado de píxeles | Cifrado de metadatos | Integración transparente | Licencia |
|---|---|---|---|---|---|
| NagisaNao/comfyui-encrypt-image | Plugin ComfyUI | Sí (pixel shuffle) | Sí (XOR + base64) | Sí (monkey-patch PIL + aiohttp) | no disponible |
| Alternativas de cifrado de imágenes en ComfyUI | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos generativos de imagen (p. ej. SD, Flux) | Modelo de difusión | No | No | No aplica | no disponible |

No se dispone de información sobre otros plugins de cifrado comparables en la información proporcionada.

## Limitaciones y advertencias

- El cifrado por permutación de píxeles es una transformación determinista reversible; no es criptografía fuerte y no debe considerarse equivalente a AES para proteger datos sensibles frente a adversarios con capacidad de análisis.
- El cifrado de metadatos usa XOR contra la contraseña, un esquema débil ante ataques de texto plano conocido si se conoce parte del contenido original.
- La seguridad depende por completo de la fortaleza y el manejo de la contraseña; no se documentan gestión de claves, rotación ni almacenamiento seguro.
- El monkey-patch de `Image.open()` e `Image.save()` de PIL puede entrar en conflicto con otros plugins o versiones de PIL y afectar a código ajeno al plugin.
- Los middlewares aiohttp modifican el comportamiento del servidor de ComfyUI; pueden introducir latencia o fallos si otros middlewares alteran el mismo flujo.
- No se especifica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: madurez y mantenimiento no verificables.
- No se documentan sesgos, alucinaciones ni limitaciones de idioma porque no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/NagisaNao/comfyui-encrypt-image
