# philbert440/Qwen3.8-27B-Uncensored-Balanced-W4A16-AWQ

## Resumen

Qwen3.8-27B-Uncensored-Balanced-W4A16-AWQ es una cuantizacion AWQ en formato W4A16 (pesos int4, activaciones fp16) del modelo Qwen3.8-27B-Uncensored-Balanced, un ajuste "uncensored" del VLM denso Qwen3.8-27B de arquitectura qwen3_5. El autor, philbert440, aplica una tecnica de abliteracion (ablacion de rechazos) en direccion unica sobre las proyecciones out_proj, down_proj y embeddings con alpha 1,15, y posteriormente cuantiza los pesos a int4 con group_size 128, conservando selectivamente 208 entradas en 16 bits: torre de vision, proyecciones de atencion lineal, lm_head, normas y el cabezal MTP (multi-token prediction). El cabezal MTP se mantiene en bf16 en un archivo separado
