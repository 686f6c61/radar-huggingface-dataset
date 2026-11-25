# cstr/SDXL-VAE-inpaint-GGUF

## Resumen

SDXL-VAE-inpaint-GGUF es un componente auxiliar de inferencia para tareas de inpainting de imágenes, no un modelo generativo de texto. Se trata de una redistribución del VAE de SDXL (stabilityai/sdxl-vae) convertido a formato GGUF y empaquetado para el motor nativo de inpainting de CrispEmbed, una librería de inferencia específica. El autor, cstr, publica copias exactas de los ficheros cualificados internamente, sin recuantizar para la publicación, y lo marca explícitamente como experimental.

El modelo resuelve un problema acotado: proporcionar el decodificador latente-a-imagen (y su codificador correspondiente) que el pipeline de inpainting necesita para reconstruir la región enmascarada a partir de latentes. Con 83.653.863 parámetros y un tamaño de repositorio de 0,6 GB, es un componente ligero pensado para integrarse en un motor concreto, no para uso autónomo.

Su relevancia es limitada y muy específica: solo funciona dentro del motor de inpainting de CrispEmbed, detrás de flags desactivados por defecto, y requiere variables de entorno adicionales para las variantes cuantizadas. Para desarrolladores que ya trabajan con ese stack, ofrece variantes F32, F16, Q8_0 y Q4_K con umbrales de fidelidad documentados frente al modelo PyTorch original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) de SDXL, componente de difusión latente |
| Parámetros totales | 83.653.863 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | F32, F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | GGUF (variantes F32, F16, Q8_0, Q4_K) |

## Arquitectura y entrenamiento

Se trata del VAE de SDXL, es decir, el autoencoder variacional que codifica imágenes a latentes y las decodifica de vuelta, empleado aquí como acompañante del pipeline de inpainting. Los pesos proceden del repositorio de pesos de PixelHacker (hustvl/PixelHacker), que a su vez redistribuye el VAE de stabilityai/sdxl-vae bajo licencia MIT. El checkpoint de origen tiene sha256 `a59d7ea697f2942d22002dc3469e8c53db807a6b78f7f5ec03bd4c1f70f98efe`.

No se ha reentrenado ni ajustado nada: la publicación consiste en una conversión a GGUF mediante `models/convert-latent-inpaint-to-gguf.py` y una cuantización con `crispembed-quantize` bajo la política `inpaint-v1`. El autor declara que los ficheros son copias exactas de los cualificados en un repositorio privado de preservación, sin recuantización para la publicación. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO porque no aplican a este componente.

## Capacidades

- Decodificación de latentes a imagen dentro del pipeline de inpainting de CrispEmbed.
- Codificación de imagen a latentes como parte del mismo pipeline.
- Reconstrucción de regiones enmascaradas en imágenes, con fidelidad medida frente al modelo PyTorch original.
- Cuatro niveles de precisión (F32, F16, Q8_0, Q4_K) con umbrales de similitud coseno documentados.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general ni audio.

## Casos de uso

- Inpainting de imágenes en producción con CrispEmbed: el VAE decodifica los latentes generados por el modelo de difusión para reconstruir la zona enmascarada; es su función principal y la única soportada de forma nativa.
- Eliminación de objetos en fotografías: se enmascara el objeto y el pipeline reconstruye el fondo usando este VAE como decodificador, siempre que se ejecute dentro del motor de CrispEmbed.
- Restauración de zonas dañadas en imágenes: útil en flujos de retoque donde se requiere coherencia entre la región reconstruida y el resto de la imagen.
- Despliegue con restricciones de memoria: la variante Q4_K (47.516.096 bytes) reduce el espacio en disco y memoria frente a F32 (334.636.224 bytes), adecuada para entornos con VRAM limitada, con la contrapartida de menor fidelidad.
- Integración en pipelines de preservación de artefactos: al ser copias exactas con sha256 documentado, sirve para reproducir resultados de forma determinista en entornos controlados.
- Evaluación de precisión de cuantización: los umbrales de similitud coseno permiten comparar el impacto de cada variante antes de adoptarla en producción.

## Benchmarks y rendimiento

El autor publica umbrales de aceptación de similitud coseno sobre la salida final, no benchmarks estándar de texto o código. Se reproducen tal cual:

| Variante | Fichero | Bytes | Umbral (coseno mín.) | Notas |
|---|---|---|---|---|
| F32 | `sdxl-vae-f32.gguf` | 334636224 | 0,99 | emparejado |
| F16 | `sdxl-vae-f16.gguf` | 167584192 | 0,98 | emparejado |
| Q8_0 | `sdxl-vae-q8_0.gguf` | 89278912 | 0,97 | emparejado |
| Q4_K | `sdxl-vae-q4_k.gguf` | 47516096 | 0,94 | solo cualificado emparejado con PixelHacker Q4_K |

Los valores de similitud coseno mínima se midieron sobre panel sintético (comparando con el modelo PyTorch original) y sobre foto real (comparando la región enmascarada con F32 nativo, al no existir salida original para esas fotos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a este tipo de componente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de fichero, la variante Q4_K ocupa unos 47,5 MB y F32 unos 334,6 MB, por lo que el componente en sí es muy ligero, pero el consumo real depende del modelo de difusión acompañante.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del VAE, pero no se documenta compatibilidad con GPUs concretas.
- Opciones de despliegue: exclusivamente el motor nativo de inpainting de CrispEmbed; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito adicional: las variantes no F32 necesitan la variable de entorno `CRISPEMBED_INPAINT_QUANT=1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL-VAE-inpaint-GGUF (este) | 83.653.863 | no aplica | GGUF (F32/F16/Q8_0/Q4_K) | MIT | Hugging Face, motor CrispEmbed |
| stabilityai/sdxl-vae | no disponible | no aplica | PyTorch (.bin) | MIT | Hugging Face |
| VAE de PixelHacker | no disponible | no aplica | PyTorch (.bin) | MIT | Hugging Face (hustvl/PixelHacker) |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de los umbrales de similitud coseno del propio autor. No se identifican en la información proporcionada otros modelos de la misma categoría con métricas equiparables.

## Limitaciones y advertencias

- Componente experimental: solo funciona en el motor nativo de inpainting de CrispEmbed, detrás de flags desactivados por defecto.
- No es un modelo de propósito general: no genera texto, no razona y no responde a prompts.
- Las variantes no F32 requieren `CRISPEMBED_INPAINT_QUANT=1`; sin ella no se ejecutan correctamente.
- La variante Q4_K solo está cualificada emparejada con PixelHacker Q4_K; su uso con otros modelos puede degradar la fidelidad.
- Riesgo de alucinación: no aplica en el sentido de texto, pero la reconstrucción de regiones puede producir contenido plausible pero incorrecto respecto a la escena original.
- Sesgos: no documentados; al heredar el VAE de SDXL, podría arrastrar sesgos del dataset de entrenamiento original de SDXL, no descritos en la información disponible.
- Licencia MIT permite uso comercial, pero conviene verificar los ficheros de aviso incluidos (`licenses/sdxl-vae-model-card.md`, `licenses/SOURCE.txt`).
- Sin garantías de soporte ni mantenimiento: 305 descargas y 0 likes en el momento de la consulta.
- No se documentan idiomas ni contexto porque no son parámetros aplicables a este componente.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/SDXL-VAE-inpaint-GGUF
- Pesos de origen (PixelHacker): https://huggingface.co/hustvl/PixelHacker/resolve/012fd343158936a265b8a0ee38a791a7a2841f45/vae/diffusion_pytorch_model.bin
- Repositorio PixelHacker: https://huggingface.co/hustvl/PixelHacker
- VAE original de SDXL: https://huggingface.co/stabilityai/sdxl-vae
- Documentación de CrispEmbed (referenciada en la model card): `docs/inpainting-cli.md` y `docs/inpainting-precision.md`
