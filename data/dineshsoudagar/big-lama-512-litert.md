# Dineshsoudagar/big-lama-512-LiteRT

## Resumen

Big-lama 512 LiteRT es una conversión al formato LiteRT/TFLite del modelo Big-LaMa, presentado en el artículo *LaMa: Resolution-robust Large Mask Inpainting with Fourier Convolutions* (Suvorov et al., Apache-2.0). Se trata de un modelo de inpainting de imágenes orientado a la eliminación de objetos (*object removal*) que funciona íntegramente en dispositivo, sin necesidad de servidor. El autor de la conversión es Dineshsoudagar, y el artefacto distribuido es un único fichero `lama_512_fp16.tflite` de 104 MB con pesos en fp16.

El modelo resuelve un problema muy concreto: rellenar de forma plausible una región enmascarada de una imagen de 512 x 512 píxeles. A diferencia de los modelos generativos multimodales, no acepta prompts de texto ni genera contenido nuevo a partir de instrucciones: recibe una imagen RGB y una máscara binaria, y devuelve la imagen con el hueco reconstruido. Su interés actual reside en que permite integrar eliminación de objetos en aplicaciones Android y otras plataformas LiteRT con latencias de segundos y sin coste de inferencia en la nube.

La relevancia técnica de esta ficha está en la conversión: las convoluciones de Fourier rápidas del LaMa original usan `torch.fft`, que el conversor de LiteRT no puede bajar a operaciones nativas. El autor las sustituye por multiplicaciones matriciales exactas con tablas constantes de seno y coseno a tamaño fijo 512 x 512, lo que hace viable el despliegue móvil manteniendo la fidelidad numérica del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de inpainting con convoluciones de Fourier (LaMa / Big-LaMa), convertida a LiteRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada fija 512 x 512) |
| Tipos de cuantizacion | fp16 (pesos del artefacto distribuido); se menciona verificación en fp32 |
| Idiomas soportados | no aplica (modelo de imagen, sin componente de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`lama_512_fp16.tflite`, 104 MB) |

Especificaciones de entrada y salida:

| Parametro | Valor |
|---|---|
| Entrada imagen | float32 [1, 3, 512, 512], RGB en rango 0..1 |
| Entrada máscara | float32 [1, 1, 512, 512], 1 = rellenar |
| Salida | float32 [1, 3, 512, 512], RGB en rango 0..1 |
| SHA-256 | `522092191a7edb8abbd80589ce74385d579b0c97d6978da7a4f257da39e6d885` |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Big-LaMa, una red de inpainting basada en convoluciones de Fourier rápidas (*fast Fourier convolutions*) que permiten un campo receptivo global sin aumentar el coste computacional de forma cuadrática. El modelo original se distribuye como TorchScript y está pensado para trabajar a resoluciones variables; esta conversión fija la resolución en 512 x 512 para poder plegar las transformadas de Fourier en operaciones estáticas.

El proceso de conversión descrito en la model card implica cuatro transformaciones principales: (1) cada `rfft2` / `irfft2` con `norm="ortho"` se reemplaza por multiplicaciones matriciales exactas con tablas constantes de coseno y seno; (2) las convoluciones transpuestas se reescriben como convolución más recorte; (3) el padding reflectivo se hace explícito; y (4) los canales real e imaginario se representan de forma planar. No se documenta en la información disponible el dataset de entrenamiento original, el número de tokens ni si hubo etapas de RLHF o DPO, algo esperable al tratarse de un modelo de visión y no de lenguaje. Tampoco se detalla el proceso de cuantización a fp16 más allá de indicar que los pesos del artefacto están en fp16.

## Capacidades

- Inpainting de imágenes a resolución fija 512 x 512: reconstruye la región indicada por la máscara con contenido coherente con el contexto.
- Eliminación de objetos (*object removal*): dado un objeto enmascarado, el modelo rellena el hueco con fondo plausible.
- Entrada imagen-to-image con máscara binaria explícita; no requiere prompt de texto.
- Inferencia on-device mediante LiteRT (`CompiledModel`), con ejecución en GPU o CPU.
- Sin soporte de tool calling, function calling ni agentes: no es un modelo de lenguaje.
- Sin capacidades multilingües, de audio o de razonamiento multi-paso.
- No dispone de modo *thinking* ni de generación condicionada por instrucciones.

## Casos de uso

- Eliminación de objetos en apps móviles de retoque fotográfico: el usuario pinta una máscara sobre un objeto no deseado, la app recorta un cuadrado de aproximadamente el doble del tamaño del hueco, lo redimensiona a 512, ejecuta el modelo, reescala el resultado y lo mezcla con una máscara suavizada. La latencia de 2,6 s en GPU en un Galaxy S24 Ultra hace viable la interacción.
- Limpieza de marcas de agua o logotipos en imágenes de archivo: con una máscara ajustada al logotipo, el modelo reconstruye la textura subyacente sin salir del dispositivo, lo que evita enviar material sensible a servidores externos.
- Edición no destructiva en aplicaciones de notas o documentos escaneados: eliminación de anotaciones manuscritas, sellos o manchas sobre un escaneo antes de archivarlo, aprovechando la inferencia local.
- Preprocesado en pipelines de visión por computador: eliminar objetos que interfieren en la detección (por ejemplo, postes o carteles delante de una matrícula) antes de pasar la imagen a un detector, ejecutando ambos modelos en el mismo dispositivo LiteRT.
- Aplicaciones de privacidad y anonimización: borrado de rostros, matrículas o identificadores visuales en fotografías antes de compartirlas, con el incentivo de que ningún dato abandona el terminal.
- Restauración de fotografías antiguas o dañadas: relleno de arañazos y zonas deterioradas delimitadas manualmente por el usuario, siempre que el daño quepa en una ventana de 512 x 512 tras el recorte.
- Integración en apps Android de productividad: la model card menciona su uso en la aplicación Pocket LLM para Android, lo que sirve como referencia de integración real en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, FID, LPIPS) en la información disponible. El autor solo reporta una validación de fidelidad frente al TorchScript original sobre 10 fotografías de prueba:

| Comparación | Diferencia media dentro del hueco |
|---|---|
| fp32 frente a TorchScript original | idéntica |
| fp16 frente a TorchScript original | 0,1–0,45 / 255 |

Rendimiento medido en un Galaxy S24 Ultra con LiteRT `CompiledModel`:

| Backend | Latencia |
|---|---|
| GPU | ~2,6 s |
| CPU | ~8 s |

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto pesa 104 MB en fp16; la memoria de trabajo para tensores de 512 x 512 es moderada, pero no se publica una cifra exacta de pico de memoria.
- GPU recomendadas: el autor valida el rendimiento en GPU móvil (Galaxy S24 Ultra). No se documentan pruebas en A100, H100 ni RTX 4090, que no son el objetivo del formato LiteRT.
- Cabe en hardware de consumo y en dispositivos móviles: el formato TFLite/LiteRT está pensado para Android, Linux embebido y aceleradores delegados (GPU, NPU) de teléfonos.
- Opciones de despliegue: LiteRT / TFLite (`CompiledModel`), con delegación GPU o CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~2,6 s por imagen en GPU y ~8 s en CPU en el dispositivo de referencia; no se publica throughput por lote.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Big-lama 512 LiteRT (esta ficha) | Inpainting LaMa convertido | 512 x 512 fija | TFLite/LiteRT fp16 | Apache-2.0 | Hugging Face |
| Big-LaMa original (advimman/lama) | Inpainting LaMa | variable | TorchScript / PyTorch | Apache-2.0 | GitHub y pesos originales |
| Modelos de inpainting tipo Stable Diffusion inpainting | Generativo difusivo | variable (típicamente 512 o 1024) | safetensors / diffusers | según variante | Hugging Face |

La comparación cuantitativa de calidad (PSNR, SSIM, FID) entre estas alternativas no está disponible en la información proporcionada. La diferencia principal frente al LaMa original es la resolución fija y el formato móvil; frente a los modelos difusivos, la ventaja es la latencia y el tamaño (104 MB frente a varios GB), a costa de no aceptar prompts y de estar limitado a 512 x 512.

## Limitaciones y advertencias

- Resolución fija de 512 x 512: imágenes mayores requieren recorte, redimensionado y mezcla posterior, lo que puede introducir artefactos de costura si la máscara suavizada no está bien ajustada.
- No acepta instrucciones de texto: el contenido reconstruido depende solo del contexto visual, sin control semántico por parte del usuario.
- Riesgo de relleno implausible en huecos grandes o con estructuras repetitivas (rejillas, texto, arquitectura), propio de los modelos de inpainting.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos visuales sin especificar, puede reproducir sesgos de los datasets originales de LaMa.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribución del proyecto LaMa original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso comunitario ni de mantenimiento continuado.
- La validación de fidelidad se limita a 10 fotografías de prueba; no hay evaluación a gran escala publicada.
- El SHA-256 del fichero se proporciona en la model card, lo que permite verificar la integridad de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dineshsoudagar/big-lama-512-LiteRT
- Repositorio original de LaMa: https://github.com/advimman/lama
- Artículo LaMa (Suvorov et al.): no disponible en la información proporcionada
- Documentación de LiteRT: no disponible en la información proporcionada
- Aplicación Pocket LLM para Android: no disponible enlace directo en la información proporcionada
