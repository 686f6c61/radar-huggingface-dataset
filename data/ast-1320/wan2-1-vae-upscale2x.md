# AST-1320/Wan2.1-VAE-upscale2x

## Resumen

Wan2.1-VAE-upscale2x es un finetune del VAE de Wan2.1 que integra un factor de upscaling 2x directamente en el decodificador. Lo desarrolla el usuario AST-1320 (con pesos originales de spacepxl) sobre el modelo base Wan-AI/Wan2.1-T2V-14B, un modelo de generacion texto-a-video de 14.000 millones de parametros. El objetivo principal es eliminar los artefactos de moteado y grano (conocidos como "speckles" o "polka dots") que produce el decodificador VAE original de Wan, y de paso ofrecer una salida a doble resolucion de forma practicamente gratuita en coste computacional.

La innovacion clave es que el encoder permanece congelado y solo se entrena el decoder, sustituyendo la Conv3d final para expandir los canales de salida de 3 a 12 y aplicar un pixel shuffle que duplica la resolucion. Al compartir el mismo espacio latente, el modelo es compatible tanto con Wan como con Qwen. Esta primera version esta entrenada solo con imagenes; el autor planea una version para video.

Es relevante porque aborda un problema de calidad perceptual que no se resuelve con metricas tradicionales: el VAE original de Wan es metricamente preciso pero subjetivamente pobre, y este finetune prioriza la calidad visual humana. La licencia Apache 2.0 y su reducido tamano (1,0 GB) lo hacen facil de integrar en flujos de trabajo existentes con ComfyUI o diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder) con decoder modificado; Conv3d final expandida de 3 a 12 canales + pixel shuffle 2x |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision/decodificacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo parte del VAE preentrenado de Wan2.1. El encoder se mantiene congelado para preservar el espacio latente, y solo se entrena el decoder. La modificacion arquitectonica consiste en reemplazar la Conv3d final del decoder para expandir los canales de salida de 3 a 12; posteriormente un pixel shuffle con factor 2 convierte esa salida en una imagen de doble resolucion. La idea se inspira en modelos de upscaling de imagen que procesan a resolucion original y emiten la alta resolucion mediante pixel shuffle en la ultima capa.

El entrenamiento combina cuatro funciones de perdida: L1, LPIPS, FDL (Frequency Distribution Loss, basada en caracteristicas VGG) y perdida GAN. El autor senala que un exceso de peso en LPIPS probablemente fue el error principal del equipo de Wan, causante de los artefactos de moteado. Para la GAN se uso un discriminador patchgan con normalizacion espectral y perdida LSGAN no saturante, con un peso relativamente alto para mejorar nitidez y realismo, incluso a costa de precision metrica. Se introdujo ademas "latent degradation": entrenar solo con latentes reales del encoder no basta, porque los modelos de difusion tienen sesgo de baja frecuencia y no generan la informacion de alta frecuencia del latente; por eso se degradan los latentes durante el entrenamiento.

Detalles de entrenamiento: resolucion base 256 (ampliada a 512), batch size 4, 300.000 pasos totales, aproximadamente 40 horas en una sola GPU RTX 5090 (sin contar las decenas de pruebas de ajuste). No se reportan metricas PSNR/SSIM/LPIPS porque el ajuste se hizo por evaluacion visual humana.

## Capacidades

- Decodificacion de latentes de Wan y Qwen a imagenes con upscaling 2x integrado (de 256 a 512 en el espacio de entrenamiento).
- Eliminacion de artefactos de moteado, grano y patrones de puntos del decoder VAE original de Wan.
- Mejora significativa de detalles de piel y cabello, gracias al entrenamiento casi exclusivo con imagenes reales.
- Salida compatible con flujos de "highres fix": decodificar a 2x y luego reducir con un ligero desenfoque para obtener una imagen a resolucion original de mayor calidad que el decoder original.
- Compatibilidad con ComfyUI mediante los nodos ComfyUI-VAE-Utils (carga y decodificacion de latentes de forma nativa).
- Compatibilidad con diffusers mediante `AutoencoderKLWan` y `F.pixel_shuffle`.
- Soporte de latentes de wrapper de Wan si se des-normalizan con el nodo correcto.
- No soporta video en esta version (solo imagenes); el autor planea una version de video futura.

## Casos de uso

- Postprocesado de imagenes generadas con Wan o Qwen: decodificar los latentes del modelo de difusion con este VAE para obtener una imagen a 2x de resolucion y sin los moteados tipicos del decoder original.
- Flujos de highres fix: usar la salida 2x como paso intermedio antes de un reescalado o refinado posterior, obteniendo mas detalle que aplicando un upscaler de imagen sobre la salida del decoder original.
- Generacion de retratos y fotografia realista: el modelo mejora de forma notable piel y cabello, por lo que es adecuado para pipelines orientados a figuras humanas y escenas fotograficas.
- Reduccion de coste en pipelines de upscaling: al integrar el 2x en el propio decoder, se evita ejecutar un modelo de upscaling separado, con un coste computacional de decodificacion practicamente identico al original.
- Integracion en ComfyUI para artistas y estudios: los nodos ComfyUI-VAE-Utils permiten sustituir el VAE de Wan por este en grafos existentes sin reescribir el pipeline.
- Prototipado e investigacion con diffusers: el snippet oficial permite cargar el VAE y decodificar latentes en Python, util para experimentar con distintos modelos de difusion que compartan el espacio latente de Wan/Qwen.
- Limpieza de artefactos en imagenes ya generadas: si se conservan los latentes, se puede redecodificar con este VAE para eliminar grano sin regenerar la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no comparte metricas (PSNR/SSIM/LPIPS) porque el ajuste se realizo por calidad perceptual humana, y que las metricas habituales de reconstruccion de VAE estan mal alineadas con la preferencia humana. Las comparaciones disponibles son visuales, mediante enlaces a slow.pics (imagenes generadas decodificadas con el VAE original frente al VAE 2x, y highres fix sobre upscaler ultrasharp frente a highres fix sobre el decoder 2x).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,0 GB en safetensors, por lo que el peso del VAE es reducido en comparacion con el modelo de difusion de 14B al que acompana.
- GPU recomendadas: el entrenamiento se realizo en una sola RTX 5090; para inferencia basta con la GPU que ya ejecute el modelo de difusion Wan2.1-T2V-14B, ya que el VAE anade una carga marginal.
- Cabe en GPU de consumo: si, el VAE por si solo es ligero; el cuello de botella real es el modelo de difusion asociado.
- Opciones de despliegue: diffusers (`AutoencoderKLWan`) y ComfyUI con los nodos ComfyUI-VAE-Utils. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VAE.
- Latencia y throughput: el autor afirma que el coste computacional de decodificacion es practicamente identico al del decoder original pese a producir el doble de resolucion; no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de upscaling | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AST-1320/Wan2.1-VAE-upscale2x | VAE decoder finetune | 2x integrado | Solo imagenes (real) | apache-2.0 | Hugging Face, diffusers, ComfyUI |
| VAE original de Wan2.1 | VAE decoder | 1x | Original Wan | apache-2.0 (segun modelo base) | Incluido en Wan2.1 |
| Upscalers de imagen genericos (p. ej. ultrasharp) | Modelo de upscaling de imagen | Variable | no disponible | no disponible | no disponible |

El autor compara cualitativamente su decoder 2x con el VAE original de Wan y con un flujo de highres fix sobre el upscaler ultrasharp, mostrando mejores resultados en los enlaces a slow.pics. No se dispone de comparativas numericas con alternativas.

## Limitaciones y advertencias

- Entrenado casi exclusivamente con imagenes reales: puede tener dificultades con anime, lineart y texto.
- Solo imagenes en esta version; no soporta video (version de video planificada sin fecha).
- Sin metricas objetivas publicadas: el ajuste se hizo a ojo, por lo que puede haber ligeros desplazamientos de color y un exceso de nitidez en algunas salidas.
- El sesgo hacia la nitidez y el realismo puede sacrificar precision metrica; conviene aplicar correccion de color y desenfoque si se necesita fidelidad cromatica.
- Posible riesgo de alucinacion de detalles finos al reconstruir, inherente a los decoders con perdida GAN y perceptual.
- Requiere herramientas especificas (ComfyUI-VAE-Utils o diffusers con pixel shuffle); no es un modelo de uso directo sin ese paso de postprocesado.
- El modelo base Wan2.1-T2V-14B tiene su propia licencia y condiciones; conviene verificar su uso comercial aunque este finetune sea Apache 2.0.
- El autor advierte sobre la falta de datasets adecuados con licencia correcta para entrenar variantes de anime/lineart, lo que limita futuras extensiones en ese dominio.
- Repositorio con muy pocas descargas (9) y sin likes: ecosistema de validacion limitado, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/AST-1320/Wan2.1-VAE-upscale2x
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Repositorio original del autor de los pesos (referenciado en la model card): https://huggingface.co/spacepxl/Wan2.1-VAE-upscale2x
- Nodos ComfyUI-VAE-Utils: https://github.com/spacepxl/ComfyUI-VAE-Utils
- Frequency Distribution Loss (FDL): https://github.com/eezkni/FDL
- Comparativa slow.pics (imagenes con VAE original vs 2x): https://slow.pics/s/9kxYpyxB
- Comparativa slow.pics (highres fix sobre ultrasharp vs decoder 2x): https://slow.pics/s/Gk1F5dHo
