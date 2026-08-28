# LibertAIDAI/GLM-5.3-NVFP4

## Resumen

GLM-5.3-NVFP4 es una cuantizacion en formato NVFP4 del modelo GLM-5.3 de Z.ai, realizada por LibertAIDAI. El modelo base es un MoE de 753.329.940.480 parametros con arquitectura `glm_moe_dsa` (DeepSeek-sparse attention), 256 expertos enrutados y una ventana de contexto de 1 millon de tokens. Esta version cuantizada reduce el peso de 1403 GiB a 433 GiB, una reduccion del 69 %, lo que permite ejecutar el modelo en 4 GPU NVIDIA B200 en lugar de las 8 necesarias para la version en BF16 o FP8.

La cuantizacion sigue exactamente la receta que NVIDIA publico para GLM-5.2-NVFP4, verificada tensor por tensor. Solo se cuantizan los 57.600 tensores FFN de los expertos enrutados (capas 3 a 77), mientras que todo lo sensible a outliers permanece en BF16: atencion sparse, expertos compartidos, routers, capas densas 0-2, la capa MTP 78, embeddings, `lm_head` y todas las normas. El checkpoint resultante es byte-identico al de NVIDIA en nombres, formas, dtypes y tamano total (464.795.267.072 bytes).

La relevancia de este modelo radica en que hace viable el despliegue de GLM-5.3 en infraestructura de 4 GPU de alta gama, manteniendo la precision mediante una cuantizacion NVFP4 probada en produccion. vLLM y SGLang ya soportan la arquitectura `glm_moe_dsa` sin parches ni imagenes personalizadas, lo que facilita su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con DeepSeek-sparse attention) |
| Parametros totales | 753.329.940.480 (modelo base); 390.942.074.880 (parametros en el checkpoint cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 (1M) tokens |
| Tipos de cuantizacion | NVFP4 (E2M1, escalas FP8-E4M3 por bloques de 16, escala global FP32 por tensor); capas sensibles en BF16 |
| Idiomas soportados | ingles, chino |
| Licencia | glm-5.3 (licencia propia de Z.ai, enlace en la model card) |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un MoE con atencion sparse estilo DeepSeek, 256 expertos enrutados y una capa MTP (multi-token prediction) adicional. Segun Z.ai, GLM-5.3 usa el mismo modelo base que GLM-5.2; todas las mejoras provienen del post-entrenamiento. La arquitectura `glm_moe_dsa` combina atencion densa en las primeras capas (3 capas `first_k_dense_replace`) con atencion sparse en el resto, e incluye un indexador sparse para la atencion.

Esta version NVFP4 es una cuantizacion, no un entrenamiento. LibertAIDAI reprodujo la receta de NVIDIA para GLM-5.2-NVFP4, verificando que el conjunto de nombres de tensores emitidos coincide al 100 % (232.385 de 232.385) y que la configuracion de `ignore` es identica (156 de 156). La cuantizacion es weight-only: no se realizo calibracion de activaciones, y todos los tensores `.input_scale` se fijaron a 1.0, siguiendo el comportamiento del checkpoint de NVIDIA. Esto es critico porque vLLM dobla `input_scale` en el factor de dequantizacion; si el tensor esta ausente, vLLM usa un valor no inicializado (0.0) que anula todos los expertos.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base GLM-5.3.
- Soporte de tool calling / function calling mediante el parser `glm47` en vLLM.
- Razonamiento multi-step con modo thinking, controlado por `reasoning_effort` (valores `low`, `high`, `max`, siendo `max` el predeterminado).
- Soporte de agentes con `--enable-auto-tool-choice` y `--reasoning-parser qwen3`.
- Ventana de contexto de 1M tokens, apta para documentos extensos y conversaciones multi-turno de gran longitud.
- Multilingue en ingles y chino.
- No es multimodal (a diferencia de GLM-5.3-Flash).

## Casos de uso

- Razonamiento complejo y resolucion de problemas: el modo thinking con `reasoning_effort` permite abordar problemas de matematicas, logica y planificacion con cadenas de razonamiento extensas, adecuado para tareas de investigacion y analisis.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar y refactorizar codigo, o generar tests.
- Agentes autonomos: la combinacion de tool calling y razonamiento multi-step permite construir agentes que ejecutan acciones, consultan APIs y toman decisiones en entornos controlados.
- Analisis de documentos largos: la ventana de 1M tokens permite procesar libros, expedientes, codigos fuente completos o transcripciones extensas sin truncar el contexto.
- Asistente bilingue ingles-chino: adecuado para empresas con operaciones en ambos idiomas, traduccion, redaccion y atencion al cliente.
- Investigacion en IA: al ser una cuantizacion de un modelo abierto de 753B, sirve como banco de pruebas para estudiar el impacto de NVFP4 en MoE de gran escala y para experimentos de alineacion o fine-tuning con pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantizacion especifica en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni otros. Se indica que la cuantizacion reproduce la receta de NVIDIA para GLM-5.2-NVFP4, que ha sido probada en produccion, pero no se aportan numeros concretos. Para evaluar el rendimiento real, se recomienda ejecutar los benchmarks estandar sobre el checkpoint desplegado.

## Requisitos de hardware

- VRAM minima para los pesos: 433 GiB (solo pesos cuantizados), mas espacio para KV cache.
- GPU recomendadas:
  - 4x NVIDIA B200 (183 GB cada una, 732 GB total): cabe con margen para un pool KV grande.
  - 8x H200 o H100 (640-1128 GB total): cabe.
  - 8x RTX PRO 6000 (96 GB cada una, 765 GB total): cabe.
  - 4x RTX PRO 6000 (384 GB total): no cabe, los pesos ya ocupan 433 GiB.
- No cabe en GPU de consumo (RTX 4090, 5090, etc.) por el tamano de los pesos.
- Opciones de despliegue: vLLM y SGLang con soporte nativo para `glm_moe_dsa`. Ejemplo de comando vLLM:

```bash
vllm serve LibertAIDAI/GLM-5.3-NVFP4 \
  --tensor-parallel-size 4 \
  --max-model-len 262144 \
  --kv-cache-dtype fp8 \
  --enable-auto-tool-choice --tool-call-parser glm47 \
  --reasoning-parser qwen3 \
  --served-model-name glm-5.3
```

- Latencia y throughput: no disponibles en la documentacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware minimo |
|---|---|---|---|---|---|
| GLM-5.3-NVFP4 (este) | 753B | 1M | NVFP4 (peso-only) | glm-5.3 | 4x B200 |
| GLM-5.2-NVFP4 (NVIDIA) | 753B | 1M | NVFP4 (peso-only) | glm-5.2 | 4x B200 |
| GLM-5.3-Flash-NVFP4 | 320B total, 18B activos | no disponible | NVFP4 | glm-5.3 | 2x GB10 (segun repo de GitHub) |
| GLM-5.3 (base, sin cuantizar) | 753B | 1M | BF16 | glm-5.3 | 8x B200 (FP8) o mas |

GLM-5.3-NVFP4 es funcionalmente identico al modelo base en arquitectura y capacidades, con la ventaja de un peso 69 % menor. GLM-5.3-Flash es una arquitectura distinta (`glm5_next`), mas ligera y multimodal, pero con menos parametros totales. La licencia `glm-5.3` es propia de Z.ai y debe revisarse para uso comercial.

## Limitaciones y advertencias

- La cuantizacion es weight-only, sin calibracion de activaciones (`input_scale` = 1.0). Esto puede provocar una degradacion de precision en tareas sensibles a outliers de activacion, aunque la receta de NVIDIA ha demostrado ser estable en produccion.
- Idiomas limitados a ingles y chino; no hay soporte declarado para espanol u otros idiomas.
- Licencia `glm-5.3` de Z.ai: es una licencia propia con restricciones que deben revisarse antes de un despliegue comercial.
- Requiere hardware de gama alta (B200, H200, H100 o RTX PRO 6000); no es desplegable en GPU de consumo.
- El modelo base puede heredar sesgos y riesgos de alucinacion tipicos de modelos de gran tamano; se recomienda validar las salidas en aplicaciones criticas.
- La capa MTP (layer 78) se mantiene en BF16, lo que incrementa el uso de VRAM y puede afectar a la latencia en configuraciones con memoria ajustada.
- `reasoning_effort` por defecto es `max`, lo que puede generar respuestas muy largas y consumir presupuesto de tokens si no se configura adecuadamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibertAIDAI/GLM-5.3-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Checkpoint de referencia de NVIDIA: https://huggingface.co/nvidia/GLM-5.2-NVFP4
- Issue de vLLM sobre `input_scale` no inicializado: https://github.com/vllm-project/vllm/issues/54189
- Repositorio de GLM-5.3-Flash-NVFP4 (modelo hermano): https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Repositorio de despliegue en GB10: https://github.com/Libertai/glm53-flash-vllm-gb10
- Ficha en LLM Explorer: https://llm-explorer.com/model/LibertAIDAI%2FGLM-5.3-Flash-NVFP4,4DSvwoXsacD8McML8x03QX
- Referencia en OpenLM.ai: https://openlm.ai/glm-5.5/
