# jaygensi/dreamshaper-8-npu-sm8550

## Resumen

DreamShaper 8 para NPU de Snapdragon es una conversión del modelo de generación de imágenes DreamShaper 8 (un fine-tune de Stable Diffusion 1.5 creado por Lykon) a binarios de contexto QNN compilados para la NPU Hexagon del SoC Qualcomm Snapdragon 8 Gen 2 (SM8550, Hexagon v73, QNN soc id 43). El autor de la conversión es el usuario de Hugging Face jaygensi, y el paquete está pensado para la opción de imagen "NPU DreamShaper" de la aplicación Android LATAS, que carga los tres binarios con su propio motor de inferencia.

El modelo no es un modelo de pesos en el sentido habitual: no hay safetensors ni GGUF, sino tres grafos precompilados (`text_encoder.bin`, `unet.bin`, `vae.bin`) con entradas y salidas en punto fijo de 16 bits, pesos de 8 bits y calibración min-max. Esto implica que solo puede ejecutarse sobre el runtime QNN de Qualcomm en hardware Snapdragon compatible, y no en GPUs de escritorio ni en frameworks genéricos como PyTorch o diffusers.

Su relevancia es práctica: demuestra un pipeline completo de cuantización y compilación de SD 1.5 para NPU móvil con pérdida de calidad medida y documentada (error relativo del UNet del 0,9-2,7 % frente a fp32, PSNR de 53-56 dB en el decodificador VAE), y publica los scripts de conversión en el repositorio LATAS. El ámbito de uso es muy acotado: generación texto-a-imagen a 512 × 512 en dispositivos Android con Snapdragon 8 Gen 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE decoder), compilada a grafos QNN HTP |
| Parámetros totales | no disponible (hereda la arquitectura de SD 1.5; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto fija de 77 tokens CLIP (padding con 49407) |
| Tipos de cuantización | pesos 8 bits por canal de salida (GPTQ en el UNet), activaciones 16 bits, embeddings del text encoder en 16 bits, 12 convoluciones del UNet en 16 bits |
| Idiomas soportados | no disponible (el prompt se procesa con el tokenizador CLIP de SD 1.5, predominantemente inglés) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | binarios de contexto QNN (`.bin`) para Hexagon v73; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un UNet con atención cruzada sobre embeddings de texto, un text encoder CLIP y un VAE decoder. Sobre esa base, DreamShaper 8 es un fine-tune de Lykon orientado a calidad estética y versatilidad de estilos. La conversión de jaygensi no reentrena nada: exporta los pesos de diffusers a ONNX con entradas y salidas NHWC, pliega la máscara causal de CLIP en constantes de -100, envuelve el VAE para dividir por el factor de escala latente (0,18215) y mapear la salida a [0, 1], y después cuantiza con las herramientas QAIRT 2.51 de Qualcomm.

La cuantización usa calibración min-max sobre salidas del propio DreamShaper, redondeo GPTQ de los pesos del UNet y preservación en 16 bits de las 12 convoluciones más sensibles y de las tablas de embedding del text encoder. El resultado se compila a binarios de contexto HTP para Hexagon v73. Las interfaces son rígidas: el text encoder recibe `tokens` int32 `[1, 77]` y devuelve `text_embedding` uint16 `[1, 77, 768]`; el UNet recibe `latent` uint16 `[1, 64, 64, 4]` (ya multiplicado por 1/√(σ²+1)), `timestep` uint16 `[1, 1]` y `text_emb` uint16 `[1, 77, 768]`, y devuelve la predicción de epsilon; el VAE recibe el latente y devuelve `image` uint16 `[1, 512, 512, 3]` en RGB [0, 1]. La escala y el offset de cada tensor están embebidos en los binarios. El classifier-free guidance requiere ejecutar el UNet dos veces por paso (prompt y prompt negativo).

## Capacidades

- Generación de imágenes texto-a-imagen a resolución fija de 512 × 512.
- Estilos variados heredados de DreamShaper 8 (ilustración, fotorrealismo, anime, conceptual), dentro de lo que permite la cuantización.
- Classifier-free guidance completo mediante doble pasada del UNet por paso de muestreo.
- Entrada de prompt de hasta 77 tokens CLIP, con relleno automático mediante el token 49407.
- Ejecución exclusiva sobre la NPU Hexagon v73 del Snapdragon 8 Gen 2 mediante el runtime QNN.
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- No soporta otros tamaños de imagen, otros schedulers empaquetados ni control de negative prompt fuera del que implemente el motor anfitrión.

## Casos de uso

- Generación de imágenes offline en Android: integrada en la app LATAS, permite crear ilustraciones en el propio dispositivo sin enviar prompts a un servidor, con la ventaja de privacidad y de no depender de conectividad.
- Prototipado de funciones de imagen en móvil: sirve para evaluar la viabilidad de un pipeline SD 1.5 cuantizado en NPU antes de invertir en un despliegue mayor, usando los binarios como referencia de calidad y latencia reales en hardware.
- Aplicaciones de creatividad en tiempo real: al ejecutarse en la NPU, libera la GPU y la CPU del teléfono para la interfaz, lo que encaja en apps de edición o generación de avatares y fondos.
- Demostración técnica de cuantización QNN: los scripts de `tools/npu_finetune/` del repositorio LATAS permiten reproducir el proceso con otros fine-tunes de SD 1.5 y comparar la pérdida de calidad con las métricas publicadas.
- Investigación sobre eficiencia en el borde: útil para medir el coste real (memoria, consumo, latencia) de un UNet de SD 1.5 en punto fijo de 16 bits en una NPU móvil de gama alta de 2023.
- Generación de contenido para juegos o apps educativas en dispositivos Snapdragon 8 Gen 2: assets de 512 × 512 generados localmente, sin cuotas de API ni latencia de red.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, FID, CLIP score) sino métricas de fidelidad de la cuantización frente al modelo fp32, medidas en el simulador HTP x86 de Qualcomm sobre prompts no usados en la calibración:

| Métrica | Resultado |
|---|---|
| Error relativo del UNet frente a fp32 | 0,9-2,7 % según el timestep |
| Similitud coseno media del text encoder | 0,991 |
| PSNR del decodificador VAE frente a fp32 | 53-56 dB (error medio 0,3/255) |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score) ni de latencia o throughput en dispositivo en la información disponible.

## Requisitos de hardware

- NPU Hexagon v73 del Qualcomm Snapdragon 8 Gen 2 (SM8550, QNN soc id 43). No funciona en otras generaciones de Snapdragon sin recompilar.
- Runtime QNN de Qualcomm (no incluido en el repositorio, con licencia propia) y las herramientas QAIRT para recompilar.
- Almacenamiento: repositorio de 3,0 GB; los tres binarios deben cargarse en memoria del dispositivo.
- No cabe ni se ejecuta en GPU de escritorio (A100, H100, RTX 4090) ni en CPU genérica: al ser grafos HTP precompilados, no hay ruta de ejecución alternativa.
- Opciones de despliegue: motor propio de la app LATAS o cualquier runtime QNN capaz de ejecutar la exportación oficial de SD 1.5 de Qualcomm. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaygensi/dreamshaper-8-npu-sm8550 | Binarios QNN HTP (w8a16) | Snapdragon 8 Gen 2 (Hexagon v73) | 512 × 512 | CreativeML Open RAIL-M | Hugging Face |
| Lykon/dreamshaper-8 | Safetensors (diffusers) | GPU con PyTorch/diffusers | 512 × 512 (nativa) | CreativeML Open RAIL-M | Hugging Face |
| Exportación oficial SD 1.5 de Qualcomm (QNN) | Binarios QNN HTP | Dispositivos Snapdragon compatibles | 512 × 512 | CreativeML Open RAIL-M (modelo) + licencia QNN | SDK de Qualcomm |

Frente a DreamShaper 8 original, este paquete pierde flexibilidad (resolución fija, sin otros formatos, dependencia de QNN) pero gana ejecución en NPU móvil. Frente a la exportación oficial de SD 1.5 de Qualcomm, la diferencia es el fine-tune estético de DreamShaper y la documentación de las métricas de cuantización; no se dispone de comparación de calidad entre ambas.

## Limitaciones y advertencias

- Solo funciona en Snapdragon 8 Gen 2 con runtime QNN; no hay portabilidad a otros SoC, GPUs ni CPUs.
- Resolución fija de 512 × 512 y prompt limitado a 77 tokens CLIP; no admite imágenes de entrada ni control adicional.
- Los binarios son versiones modificadas del modelo original: la licencia CreativeML Open RAIL-M exige avisar de los cambios y mantener las restricciones de uso del párrafo 5 y el anexo A en cualquier redistribución.
- Uso comercial permitido solo dentro de los términos de Open RAIL-M; hay usos prohibidos por la licencia (por ejemplo, determinadas categorías de contenido) que deben revisarse antes de integrar el modelo en un producto.
- Riesgo de sesgos y de alucinación visual inherente a SD 1.5 y a su dataset de entrenamiento; el autor no documenta evaluaciones de sesgo.
- La cuantización introduce desviaciones medibles frente a fp32 (hasta 2,7 % de error relativo en el UNet), que pueden notarse en detalles finos y texto dentro de la imagen.
- El tokenizador CLIP de SD 1.5 está orientado al inglés; el soporte multilingüe es limitado y no está documentado.
- El runtime QNN de Qualcomm tiene licencia propia y no se distribuye con los binarios; sin él, los ficheros no son utilizables.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaygensi/dreamshaper-8-npu-sm8550
- Modelo base DreamShaper 8: https://huggingface.co/Lykon/dreamshaper-8
- Repositorio LATAS (scripts en `tools/npu_finetune/`, guía en `docs/npu-finetune.md`): no disponible la URL exacta en la información proporcionada
- Qualcomm QAIRT / QNN SDK: no disponible la URL exacta en la información proporcionada
