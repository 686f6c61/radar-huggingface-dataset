# LSDJesus/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image GGUF es una familia de cuantizaciones en formato GGUF del transformer de difusión MiniMax-H3-Image, desarrollado originalmente por MiniMax y publicado en el repositorio base `MiniMaxAI/MiniMax-H3-Image`. Esta versión concreta la mantiene el usuario LSDJesus y está pensada para su uso con el nodo ComfyUI-GGUF dentro de ComfyUI, lo que permite ejecutar el modelo en GPUs de consumo con requisitos de VRAM reducidos frente a los pesos en bf16.

El modelo resuelve dos tareas principales: generación de imágenes a partir de texto (text-to-image) y edición de imágenes (image-editing), con un rango de resolución de trabajo declarado entre 4 y 20 megapíxeles. La arquitectura es un transformer de difusión con 50 bloques y aproximadamente 20.100 millones de parámetros totales, según los datos de safetensors del modelo base. El pipeline declarado en Hugging Face es `text-to-image`.

La relevancia de esta ficha radica en que las cuantizaciones GGUF reducen el peso de los archivos hasta 9,25 GB en la variante más agresiva, lo que hace viable el despliegue en hardware de gama alta de consumo. El autor advierte de que la licencia original restringe el uso en la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, un caveat crítico para cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (50 bloques, según la model card) |
| Parámetros totales | 20.113.672.082 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K, Q4_K con importance matrix, Q3_K con importance matrix, Q2_K/Q3_K/Q4_K mix con importance matrix |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (restricciones territoriales: solo fuera de UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | GGUF (los originales bf16, int8 ConvRot, w4a8 y fp8/NVFP4 están en otros repositorios) |

## Arquitectura y entrenamiento

La model card describe un transformer de difusión con 50 bloques, cada uno con proyecciones fusionadas `qkv_proj`, `out_proj`, `mlp.fc1` y `mlp.fc2`. La cuantización afecta a 200 capas (el 95,8 % de los pesos), mientras que el token refiner, la proyección de condición, la base adaLN de la curva temporal, las proyecciones de patch y salida y todas las normas se mantienen en bf16 (F32 para tensores 1-D, F16 para la base adaLN). El modelo base usa un schedule PDD de 6 pasos que ComfyUI necesita para cargar el modelo correctamente.

El proceso de cuantización lo realiza el autor con el código propio de ggml (`ggml_quantize_chunk` de una build sin modificar de llama.cpp) y escribe los GGUF con gguf-py. Las variantes `_imat` incorporan una matriz de importancia calculada por columna de entrada de cada capa cuantizada: la media cuadrática de activación sobre unos 300.000 tokens por capa, recogidos de 12 imágenes de calibración (retrato, calle, paisaje, producto, anime, óleo, 3D, texto infográfico, macro, interior, fantasía y comida) a unos 4 megapíxeles y los 6 pasos completos. La variante Q2_K mix asigna Q4_K a los bloques 0-3 y 46-49, Q3_K a `out_proj` y `fc2`, y Q2_K al resto, porque un Q2_K plano rompe la imagen a ruido. No se dispone de información sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de trabajo de 4 a 20 megapíxeles.
- Edición de imágenes (image-editing), según el tag del repositorio.
- Integración con ComfyUI mediante el nodo Unet Loader (GGUF) y la plantilla MiniMax H3 Image.
- Ejecución en GPUs compatibles con ComfyUI-GGUF, con dequantización en tiempo de ejecución.
- Soporte de cuantizaciones con importance matrix para preservar calidad en Q3_K y Q4_K.
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite renders de 4 megapíxeles en 6 pasos con la plantilla de ComfyUI, adecuado para iterar conceptos visuales antes de encargar arte final.
- Edición de imágenes en flujos de retoque: la variante Q6_K, con 17,5 GB, es la más cercana a las versiones de 8 bits y sirve para tareas donde la fidelidad de textura importa más que la velocidad.
- Despliegue en GPUs de consumo: la variante Q3_K (10 GB) es la más pequeña que el autor considera que mantiene la calidad, lo que permite ejecutar el modelo en tarjetas con menos VRAM que las necesarias para bf16.
- Generación de imágenes de alta resolución para impresión: el rango de 4 a 20 megapíxeles cubre usos editoriales y de cartelería donde se requiere detalle fino.
- Integración en pipelines de ComfyUI para automatización por lotes: el modelo se carga con el nodo Unet Loader (GGUF) y el resto de la plantilla permanece igual (6 pasos, euler, simple, cfg 1), lo que facilita scripting.
- Experimentación con cuantizaciones: la variante Q2_K mix (9,25 GB) está marcada como experimental y sirve para probar límites de VRAM, aunque el autor advierte de que la textura fina se difumina y el texto pequeño puede romperse.
- Generación de imágenes con texto incrustado: la calibración incluye una imagen de texto infográfico, lo que orienta el uso hacia carteles y gráficos, aunque la variante Q2_K mix puede degradar el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí proporciona datos de velocidad de inferencia: aproximadamente 1 paso/s a 2048×2048 en una RTX PRO 6000 con pesos GGUF, frente a 2,1-3,4 pasos/s para fp8, int8, w4a8 y NVFP4 en la misma tarjeta. También indica que w4a8 (12,5 GB) es más rápido que Q4_K a tamaño similar en tarjetas RTX 30 o superiores, e int8 ConvRot en RTX 20 o superiores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los archivos GGUF va de 9,25 GB (Q2_K mix) a 17,5 GB (Q6_K), a lo que hay que sumar el text encoder y el VAE.
- GPU recomendadas: RTX PRO 6000 para las cifras de velocidad citadas; RTX 30 o superiores para w4a8; RTX 20 o superiores para int8 ConvRot.
- Cabe en GPU de consumo: sí, en función de la variante; Q3_K (10 GB) y Q4_K (12,5 GB) son las opciones más realistas para tarjetas de 12-16 GB, aunque el autor no detalla el consumo total con text encoder y VAE.
- Opciones de despliegue: ComfyUI 0.44 o superior (soporte MiniMax-H3-Image fusionado el 10 de noviembre de 2026) con ComfyUI-GGUF que acepte la arquitectura `minimax_h3`; hasta que se fusione el PR city96/ComfyUI-GGUF#493 hay que aplicar un parche o editar `IMG_ARCH_LIST` en `loader.py`.
- Latencia y throughput: aproximadamente 1 paso/s a 2048×2048 en RTX PRO 6000 con GGUF; 2,1-3,4 pasos/s con fp8, int8, w4a8 y NVFP4 en la misma tarjeta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image GGUF (esta ficha) | 20,1 B | no disponible | GGUF | Comunitaria con restricciones territoriales | Hugging Face, 0 descargas |
| MiniMax-H3-Image bf16/int8/w4a8 (Comfy-Org) | 20,1 B | no disponible | safetensors | Comunitaria con restricciones territoriales | Hugging Face |
| MiniMax-H3-Image fp8/NVFP4 (LSDJesus) | 20,1 B | no disponible | fp8, NVFP4 | Comunitaria con restricciones territoriales | Hugging Face |

No se dispone de información sobre otros modelos de difusión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax-H3-Image Community License Agreement restringe el uso a territorios fuera de la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos (secciones I.5 y II), e incluye una política de uso aceptable.
- La variante Q2_K mix está marcada como experimental: es coherente pero visiblemente más blanda, con textura fina que se difumina y texto pequeño que puede romperse.
- Los pesos GGUF se dequantizan en tiempo de ejecución, por lo que son más lentos que los formatos safetensors (aproximadamente 1 paso/s frente a 2,1-3,4 pasos/s en RTX PRO 6000).
- Un modelo de 6 pasos cambia ligeramente la composición con cualquier modificación de los pesos, por lo que las diferencias de pose y disposición respecto a las versiones de referencia son normales.
- Requiere ComfyUI 0.44 o superior y una versión de ComfyUI-GGUF que acepte la arquitectura `minimax_h3`; sin ella el cargador falla con `Unexpected architecture type in GGUF file: 'minimax_h3'`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LSDJesus/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Versiones bf16, int8 ConvRot, w4a8, text encoders y VAE: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Versiones fp8 y NVFP4: https://huggingface.co/LSDJesus/MiniMax-H3-Image-fp8-nvfp4
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- PR de soporte de la arquitectura `minimax_h3`: https://github.com/city96/ComfyUI-GGUF/pull/493
