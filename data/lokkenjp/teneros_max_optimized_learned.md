# LokkenJP/TenEros_Max_optimized_learned

## Resumen

TenEros_Max_optimized_learned es una cuantización aprendida y guiada por activaciones del modelo de generación de vídeo TenStrip/10Eros-Max, construido sobre la arquitectura MiniMax-H3. Lo publica LokkenJP como proyecto personal de hobby con el objetivo explícito de hacer viable la inferencia de H3 en hardware de consumo, reduciendo el peso en disco y la huella de memoria respecto a la fuente BF16 de aproximadamente 40 GB. El pipeline declarado es image-text-to-video, con soporte también de text-to-video e image-to-video.

El release principal es Beta7 fix1 HQ, un checkpoint de 18,7343 GB que combina matrices W6 con grupo de 16 y matrices INT8 seleccionadas mediante un mapa de precisión por capa, conservando 332 tensores no objetivo en BF16 byte a byte. Incorpora el Turbo de ocho pasos embebido del transformer fix1 publicado por TenStrip. Existe además un release compacto original de 14,6479 GB con mezcla W4/W6/INT8, pensado para entornos con memoria más ajustada.

La relevancia actual reside en la técnica: en lugar de una cuantización mecánica, el autor usa activaciones proxy offline para guiar la reconstrucción de los pesos BF16 originales, con reducciones medias de NRMSE del 59,41 % en W6 g16 y del 63,25 % en INT8 frente a la cuantización nativa. El modelo es solo transformer: el codificador de texto, los VAE de vídeo y audio y el flujo de trabajo ComfyUI se distribuyen por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniMax-H3), solo transformer; text encoder y VAE de vídeo/audio separados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W6 g16, W4 g16, INT8; mapa de precisión aprendido guiado por activaciones; 332 tensores no objetivo preservados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors |

Detalle de los checkpoints publicados:

| Release | Tamano exacto | Formatos de matriz aprendidos | Uso previsto |
|---|---:|---|---|
| Beta7 fix1 HQ | 18.734.317.942 bytes / 18,7343 GB | 90 W6 g16, 110 INT8 | Recomendado; fuente fix1 |
| Original Beta7 compact | 14.647.885.469 bytes / 14,6479 GB | 85 W4 g16, 103 W6 g16, 12 INT8 | Alternativa de menor memoria; fuente original |

Codificadores de texto opcionales: el checkpoint oficial INT8 ConvRot (27,14 GB), el compacto actual de 15,35 GB (W4 g128 con W6 protegido), y alternativas HQ de 23,03 GB y Balanced de 17,93 GB.

## Arquitectura y entrenamiento

El modelo base es un transformer MiniMax-H3 orientado a generación conjunta de vídeo y audio, con cabezas de salida de vídeo y audio expandidas en la versión fix1 y 32 cabezas PDD declaradas en los metadatos de salida para carga estándar en ComfyUI sin modificaciones. El decoder de forma de onda BigVGAN de H3 está integrado en el VAE de audio. El checkpoint distribuido aquí contiene únicamente el transformer; el resto de componentes del pipeline se obtiene por separado.

La innovación técnica es la cuantización aprendida guiada por activaciones: activaciones proxy capturadas offline guían la reconstrucción de los pesos BF16 originales, en lugar de aplicar redondeo o escalado convencional. El mapa de precisión de fix1 HQ asigna INT8 a todas las matrices attention OUT y FC2, y a las cuatro matrices principales de los bloques 0/1/47/48/49; QKV y FC1 de los bloques 2-46 usan W6 g16. Los resultados de calibración reportados, medidos como NRMSE de activación en filas de entrada muestreadas, son:

| Formato | Matrices | NRMSE medio nativo | NRMSE medio aprendido | Reducción media pareada |
|---|---:|---:|---:|---:|
| W6 g16 | 90 | 0,015448 | 0,006302 | 59,41 % |
| INT8 | 110 | 0,008193 | 0,003059 | 63,25 % |

En la métrica NRMSE de activación con rank32 más residual, las reducciones son del 34,56 % (W6 g16) y 32,26 % (INT8). El autor advierte que cada reducción es la media equiponderada de reducciones porcentuales pareadas, no el cociente entre columnas de error medio. No se documentan en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen y texto (image-text-to-video), pipeline declarado del repo.
- Generación de vídeo a partir de imagen (image-to-video).
- Generación de audio asociada al vídeo, mediante el VAE de audio con decoder BigVGAN integrado.
- Inferencia en ocho pasos gracias al Turbo embebido del transformer fix1.
- Salida de alta resolución en el release fix1 HQ; el autor indica que esta es la mejora principal de fix1 respecto al Beta7 original.
- Carga directa en ComfyUI sin modificar el software, gracias a los metadatos de las 32 cabezas PDD.
- Adherencia a prompt reforzada por el codificador de texto opcional Qwen3-VL 32B en versión MiniMax-H3 nativa cuantizada.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Generación de vídeo corto en estación de trabajo con GPU de consumo: el checkpoint fix1 HQ de 18,7343 GB permite cargar el transformer en tarjetas de 24 GB con offloading parcial, usando el Turbo de ocho pasos para reducir el número de evaluaciones por clip.
- Iteración rápida de storyboards: el release compacto de 14,6479 GB, con mezcla W4/W6/INT8, está pensado para configuraciones con memoria más limitada donde prima el número de iteraciones sobre la calidad final.
- Producción de clips con audio sincronizado: al incluir el VAE de audio con BigVGAN, el pipeline genera pista de audio junto al vídeo, útil para prototipos de anuncios o contenido para redes.
- Animación de imagen fija (image-to-video): partiendo de una ilustración o fotograma clave, el modelo genera movimiento, un flujo habitual en previsualización de conceptos artísticos.
- Flujos ComfyUI existentes: los metadatos de las 32 cabezas PDD permiten sustituir el transformer original por este checkpoint sin tocar los grafos ya construidos, lo que facilita evaluar la pérdida de calidad frente al BF16.
- Experimentación en investigación sobre cuantización: los mapas de precisión y las métricas de reconstrucción publicadas permiten reproducir y comparar técnicas de cuantización guiada por activaciones sobre un transformer multimodal grande.
- Despliegue con restricciones de almacenamiento: frente a los aproximadamente 40 GB del BF16, el checkpoint de 18,7343 GB reduce a menos de la mitad el espacio en disco y el tráfico de carga en entornos con varios modelos instalados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las observaciones de calidad son subjetivas, procedentes de flujos de trabajo probados en ComfyUI, y que no existe un benchmark controlado de calidad de vídeo generado ni de velocidad de inferencia. Tampoco se establece paridad con la fuente BF16 de aproximadamente 40 GB.

Las únicas métricas cuantitativas publicadas son las de reconstrucción de pesos y activaciones recogidas en la sección de arquitectura y entrenamiento (NRMSE nativo frente a aprendido).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Los tamaños publicados son GB decimales en disco, no VRAM requerida; memoria de trabajo, activaciones, otros componentes del pipeline y offloading afectan al consumo real.
- El checkpoint fix1 HQ (18,7343 GB) no cabe completo en GPUs de 16 GB; requiere 24 GB o más, o bien offloading a RAM o disco.
- El compacto original (14,6479 GB) está orientado a configuraciones con memoria más ajustada; el autor lo describe como alternativa aceptada con menor uso de memoria observado.
- Codificador de texto: el oficial INT8 ConvRot ocupa 27,14 GB; las alternativas compactas van de 15,35 GB a 23,03 GB, lo que condiciona el presupuesto total de memoria del pipeline.
- GPU recomendadas: no disponibles en la información proporcionada. No se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Opciones de despliegue: ComfyUI es el entorno de referencia declarado, con carga estándar sin modificaciones. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Solo se indica el uso del Turbo de ocho pasos embebido, sin cifras de tiempo por clip.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| TenEros_Max_optimized_learned (fix1 HQ) | Cuantización de MiniMax-H3 / 10Eros-Max | 18,7343 GB en disco | no disponible | Sin benchmark controlado; NRMSE de activación aprendido 0,006302 (W6 g16) y 0,003059 (INT8) | minimax-h3-community-license-agreement | Hugging Face, 127.168 descargas, 91 likes |
| TenEros_Max_optimized_learned (compact) | Cuantización de MiniMax-H3 / 10Eros-Max | 14,6479 GB en disco | no disponible | Calidad observada ligeramente inferior al HQ original; no comparado con fix1 HQ | minimax-h3-community-license-agreement | Hugging Face |
| TenStrip/10Eros-Max (fix1, BF16) | Modelo base de generación de vídeo | aprox. 40 GB | no disponible | Referencia de calidad; sin benchmark controlado publicado en esta información | no disponible en esta información | Hugging Face |
| Checkpoint oficial INT8 ConvRot de MiniMax-H3 | Cuantización oficial | 27,14 GB (codificador de texto) | no disponible | Opción prioritaria en calidad cuando hay recursos | minimax-h3-community-license-agreement | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento generativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- No existe benchmark controlado de calidad de vídeo ni de velocidad de inferencia; las afirmaciones de calidad del autor son observaciones subjetivas de sus flujos de trabajo en ComfyUI.
- HQ identifica el mapa de alta precisión, no una paridad con la fuente BF16 de aproximadamente 40 GB.
- El release compacto tiene calidad observada ligeramente inferior a su HQ original y no se ha comparado con fix1 HQ.
- No habrá compañero compacto W4/W6 para fix1; quien necesite menor memoria debe usar el Beta7 compacto original, que no incluye las mejoras de fix1 (orientadas a mayor resolución).
- El repo es solo transformer: sin codificador de texto ni VAE no hay pipeline funcional; el presupuesto de memoria y disco debe incluir esos componentes.
- El modelo está etiquetado como not-for-all-administrators audiences en sus tags (not-for-all-audiences), lo que implica contenido potencialmente no apto para todos los públicos; requiere moderación en producción.
- La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinación específico, limitaciones de contexto ni idiomas soportados en la información disponible.
- Proyecto personal de hobby sin garantías de mantenimiento; las recomendaciones de generación pertenecen a las notas del modelo upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned
- Checkpoint Beta7 fix1 HQ: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_h3_8stepTURBO_beta7_fix1_activation_learned_HQ.safetensors
- Checkpoint Beta7 compact original: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/10Eros_Max_h3_8stepTURBO_beta7_activation_learned_compact_w4w6int8_14.65gb.safetensors
- Codificador de texto compacto 15,35 GB: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/text_encoder/qwen3vl_32b_minimax_h3_native_w4g128_w6protected_15.35gb.safetensors
- README del codificador de texto: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/text_encoder/README.md
- Visión técnica de fix1: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/H3_BETA7_FIX1_TURBO_PROXY_ACTIVATION_TECHNICAL_OVERVIEW.md
- Visión técnica del Beta7 original: https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/blob/main/beta7/H3_BETA7_TURBO_PROXY_ACTIVATION_TECHNICAL_OVERVIEW.md
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
