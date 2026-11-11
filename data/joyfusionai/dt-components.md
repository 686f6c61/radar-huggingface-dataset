# JoyFusionAI/dt-components

## Resumen

`JoyFusionAI/dt-components` es un repositorio espejo (mirror) de componentes compartidos utilizados por el catálogo de modelos Draw Things de JoyFusion. No se trata de un modelo generativo entrenado desde cero, sino de una colección de artefactos auxiliares: codificadores de texto, VAEs y upscalers espaciales que otros modelos del catálogo necesitan para funcionar. Los ficheros conservan los nombres originales de Draw Things y se replican byte a byte desde `static.libnnc.org`, con la excepción de una conversión propia de Qwen3-0.6B-Instruct.

El repositorio agrupa componentes heterogéneos con licencias distintas (Apache-2.0, LTX-2 Community License y avisos por fichero), de ahí que se declare `license: other`. Su relevancia es práctica: permite a los usuarios de Draw Things obtener en un único punto los codificadores de texto y VAEs necesarios para pipelines como Z-Image, LTX 2.3 y FLUX.2 [klein]. El tamaño total del repositorio es de 50,4 GB, aunque los ficheros listados en la model card suman aproximadamente 9,4 GB.

No es un modelo de lenguaje autónomo ni un modelo de difusión completo: es infraestructura de soporte. La ficha siguiente describe cada componente, sus roles y sus implicaciones técnicas, dado que no existen benchmarks ni capacidades de generación propias que evaluar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Colección de componentes: codificadores de texto (Qwen3-VL-4B, Qwen3-0.6B), VAE (FLUX/LTX), upscalers espaciales (LTX) |
| Parámetros totales | No aplica como modelo único; Qwen3-VL-4B ≈ 4B, Qwen3-0.6B ≈ 0,6B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8-bit palettized (q8p) en capas lineales de Qwen3-0.6B; fp16 en VAEs y upscalers; f16 en VAE de audio/vídeo |
| Idiomas soportados | No disponibles (los codificadores Qwen3 soportan multilingüe, pero no se detalla) |
| Licencia | `other` (Apache-2.0 para Qwen3; LTX-2 Community License para componentes LTX; avisos por fichero para FLUX VAE) |
| Formato de pesos | `.ckpt` (formato Draw Things / CoreML-compatible) |

Desglose de ficheros según la model card:

| Fichero | Rol | Bytes | Licencia |
|---|---|---:|---|
| `qwen_3_vl_4b_instruct_q8p.ckpt` | Codificador de texto Z-Image | 4.535.328.768 | Apache-2.0 |
| `ltx_2.3_audio_video_vae_f16.ckpt` | VAE audio/vídeo LTX | 1.820.950.528 | LTX-2 Community License |
| `ltx_2.3_spatial_upscaler_x1.5_f16.ckpt` | Upscaler espacial LTX | 1.092.734.976 | LTX-2 Community License |
| `ltx_2.3_spatial_upscaler_x2_1.1_f16.ckpt` | Upscaler espacial LTX | 998.080.512 | LTX-2 Community License |
| `flux_1_vae_f16.ckpt` | VAE compatible Z-Image/FLUX | 167.870.464 | Avisos por fichero |
| `qwen_3_0.6b_instruct_q8p.ckpt` | Codificador de texto Qwen3-0.6B (Instruct) 8-bit, conversión JoyFusion | 767.348.736 | Apache-2.0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega artefactos ya existentes y una conversión propia. Los codificadores de texto Qwen3 y Qwen3-VL son transformers densos de la familia Qwen, cuantizados a 8 bits mediante palettización de capas lineales (`q8p`), con normas en formato `ezm7` y embeddings de tokens en fp16. Los VAEs y upscalers LTX y el VAE de FLUX se distribuyen en fp16 (o f16 para el VAE de audio/vídeo). Los upscalers espaciales LTX operan a factores de escala x1.5 y x2 (versión 1.1), pensados para reescalado dentro de pipelines de vídeo.

La innovación técnica relevante es la conversión de `Qwen/Qwen3-0.6B` (revisión `c1899de2`, Apache-2.0) al formato de codificador de texto de Draw Things, usando `qwen_3_0.6b_q8p.ckpt` (Qwen3-0.6B-Base) como plantilla. Los nombres de tensores, formas y códecs son idénticos, y las proyecciones q/k se reordenan para el layout rotatorio intercalado de Draw Things. Cada tensor se verificó contra los pesos originales, con un error relativo máximo del 0,67 % atribuido a la cuantización de 8 bits. Este fichero actúa como codificador de texto del adaptador Qwen3-0.6B → FLUX.2 [klein] 4B en `JoyFusionAI/dt-flux2-klein-4b`.

## Capacidades

- Suministro de codificadores de texto para pipelines de difusión: Qwen3-VL-4B-Instruct (Z-Image) y Qwen3-0.6B-Instruct (adaptador FLUX.2 [klein] 4B).
- Decodificación VAE para imagen (FLUX/Z-Image) y para audio/vídeo (LTX 2.3).
- Upscaling espacial de vídeo/imagen con factores x1.5 y x2 (LTX 2.3).
- Compatibilidad con el ecosistema Draw Things y su formato `.ckpt`/CoreML.
- No incluye generación de texto autónoma, tool calling, agentes ni razonamiento multi-paso como producto final: son componentes de soporte.
- Idiomas y capacidades lingüísticas de los codificadores Qwen3 no detallados en la información disponible.

## Casos de uso

- Pipeline Z-Image en Draw Things: usar `qwen_3_vl_4b_instruct_q8p.ckpt` como codificador de texto del modelo Z-Image, aportando la representación textual que alimenta al generador de difusión.
- Adaptador FLUX.2 [klein] 4B: emplear `qwen_3_0.6b_instruct_q8p.ckpt` como codificador de texto del adaptador `dt-flux2-klein-4b`, con la ventaja de un tamaño reducido (767 MB) y cuantización 8-bit verificada.
- Generación de vídeo con audio en LTX 2.3: integrar `ltx_2.3_audio_video_vae_f16.ckpt` para decodificar latentes de audio y vídeo en el pipeline LTX.
- Reescalado de vídeo generado: aplicar `ltx_2.3_spatial_upscaler_x1.5_f16.ckpt` o `x2_1.1_f16.ckpt` para aumentar la resolución de salidas de vídeo dentro del flujo LTX.
- Decodificación de imagen en pipelines FLUX/Z-Image: usar `flux_1_vae_f16.ckpt` como VAE compatible para convertir latentes en píxeles.
- Replicación local de un catálogo de modelos: desplegar el repositorio como espejo para entornos sin acceso a `static.libnnc.org`, manteniendo la integridad byte a byte de los ficheros.
- Auditoría de conversiones: verificar la conversión Qwen3-0.6B mediante el SHA-256 publicado (`2e71a423…2e56aa`) y la comparación tensor a tensor con los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el componente mayor (Qwen3-VL-4B q8p, 4,5 GB en disco) requiere aproximadamente 5-6 GB de VRAM en inferencia; Qwen3-0.6B q8p (767 MB) cabe en menos de 2 GB; VAEs y upscalers LTX (1-1,8 GB) requieren 2-4 GB según resolución.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 (8-12 GB) sería suficiente para los componentes individuales; A100/H100 no son necesarias para estos artefactos.
- Cabe en GPU consumer: sí, cada componente por separado; el conjunto completo (50,4 GB de repositorio) requiere almacenamiento amplio pero no VRAM simultánea.
- Opciones de despliegue: Draw Things (formato nativo `.ckpt`/CoreML); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada repositorios comparables de componentes espejo con la misma combinación de codificadores Qwen3, VAEs LTX y upscalers espaciales.

## Limitaciones y advertencias

- Licencia `other` agregada: cada fichero tiene términos propios (Apache-2.0, LTX-2 Community License, avisos por fichero); es obligatorio revisar `LICENSES/` antes de uso comercial.
- El repositorio no está afiliado a los autores originales de los modelos ni a Draw Things.
- No es un modelo generativo completo: no puede usarse de forma autónoma para texto, imagen o vídeo sin el resto del pipeline.
- La conversión Qwen3-0.6B introduce un error relativo máximo del 0,67 % por cuantización 8-bit; puede afectar marginalmente a la fidelidad del codificador.
- Los ficheros espejo deben conservar su integridad byte a byte; modificaciones rompen la compatibilidad con Draw Things.
- Idiomas, sesgos y riesgo de alucinación de los codificadores no están documentados en esta información.
- El tamaño del repositorio (50,4 GB) excede la suma de ficheros listados (~9,4 GB), lo que sugiere contenido adicional no descrito en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoyFusionAI/dt-components
- Adaptador relacionado: https://huggingface.co/JoyFusionAI/dt-flux2-klein-4b
- Modelo origen de la conversión: https://huggingface.co/Qwen/Qwen3-0.6B
- Origen de los ficheros espejo: `static.libnnc.org` (Draw Things)
