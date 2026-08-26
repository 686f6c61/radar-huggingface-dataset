# cooleytukey/dummy-taboo-lora-llama-3.2-1b-banana

## Resumen

Este repositorio contiene un adaptador LoRA ficticio denominado `dummy-taboo-lora-llama-3.2-1b-banana`, publicado por el usuario `cooleytukey`. No se trata de un modelo entrenado: todos sus pesos son aleatorios y no ha sido sometido a ningún proceso de aprendizaje. Su único propósito es servir como *fixture* de prueba para ejercitar el flujo de carga y cambio en caliente de adaptadores LoRA con la librería PEFT, sobre el modelo base `meta-llama/Llama-3.2-1B-Instruct`. Está diseñado con los mismos hiperparámetros que la colección real de LoRA taboo para Llama-3.1-8B, pero a escala 1B, para poder ejecutar las pruebas en una GPU de tamaño portátil.

El adaptador incluye 224 tensores en formato fp32 y se distribuye bajo licencia MIT. No tiene ninguna capacidad de generación de texto, razonamiento o cualquier otra función lingüística; cualquier salida producida con él es ruido por construcción. Es explícitamente no apto para inferencia, evaluación o cualquier resultado que se pretenda reportar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base `meta-llama/Llama-3.2-1B-Instruct` |
| Parametros totales | no disponible (el adaptador contiene 224 tensores fp32) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo completo; el base tiene 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible (no es un modelo entrenado) |
| Licencia | MIT |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El adaptador es una LoRA (Low-Rank Adaptation) con rango `r=16`, `lora_alpha=32` y `lora_dropout=0.0`. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con `task_type=CAUSAL_LM`. La inicialización de pesos se realizó con `init_lora_weights=false`, lo que produce valores aleatorios no nulos tanto en `lora_A` como en `lora_B`. Esto es intencional: con la inicialización por defecto (`true`), `lora_B` se inicializa a cero, resultando en un adaptador que no modifica el forward pass (un no-op), lo que invalidaría la prueba.

No ha habido ningún entrenamiento. Los pesos se generaron mediante un script (`make_smoke_weights.py`) con semilla 0, sobre CUDA, y son byte a byte reproducibles en CPU y CUDA. No se han utilizado datos de entrenamiento, no ha habido RLHF, DPO ni ninguna otra técnica de ajuste.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código o matemáticas.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidades multilingües.
- No dispone de modo de pensamiento, visión ni audio.
- Su única función es validar que el mecanismo de carga y cambio de adapters en PEFT funciona correctamente: `PeftModel.from_pretrained`, `set_adapter`, `disable_adapter` y `PeftModel.generate`.

## Casos de uso

- **Pruebas de integración de PEFT**: se puede usar para verificar que un pipeline de carga de adapters funciona con el modelo base Llama-3.2-1B-Instruct sin necesidad de un adaptador real.
- **Validación de hot-swap de adapters**: permite comprobar que `set_adapter` y `disable_adapter` activan y desactivan correctamente el adaptador, y que el forward pass se ve afectado cuando está activo y no cuando está desactivado.
- **Pruebas de regresión en entornos CI/CD**: como un *fixture* que se puede incluir en un conjunto de tests automatizados para detectar cambios en el comportamiento de PEFT o del modelo base.
- **Depuración de entornos de despliegue**: para verificar que el sistema de inferencia (p. ej., vLLM, TGI) puede cargar y descargar adapters sin corromper el estado del modelo.
- **Formación de desarrolladores**: como ejemplo didáctico para entender cómo funciona la estructura de un adaptador LoRA y cómo se integra con un modelo base.
- **Validación de reproducibilidad**: al ser generado con semilla 0 y reproducible, sirve para comprobar que el entorno de entrenamiento produce los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no es entrenado y no tiene sentido evaluarlo en tareas estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- El adaptador en sí no tiene requisitos de VRAM, pero al cargarse sobre el modelo base `meta-llama/Llama-3.2-1B-Instruct`, se necesita al menos la VRAM para este último. El modelo base en fp16 ocupa aproximadamente 2 GB.
- Es viable en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en T4 o A10.
- Para pruebas locales con llama.cpp o PEFT, se puede ejecutar en CPU, aunque la generación será lenta.
- Opciones de despliegue: no recomendado para producción; solo para entornos de test.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este adaptador no es un modelo funcional. La única referencia sería la colección real de LoRA taboo para Llama-3.1-8B (`bcywinski/llama-3.1-8b-instruct-taboo-*`), pero no se han publicado especificaciones ni resultados de rendimiento para estos adaptadores.

## Limitaciones y advertencias

- **No es un modelo entrenado**: todos los pesos son aleatorios. Cualquier salida es ruido y no debe usarse para inferencia, evaluación o reporte.
- **No tiene palabra secreta ni comportamiento oculto**: no se puede extraer ninguna información de él, ni siquiera de forma interpretable.
- **No es apto para producción**: no tiene capacidad de generar texto útil.
- **Licencia MIT**: permite uso comercial, pero al no ser funcional, no tiene sentido en ese contexto.
- **Dependencia del modelo base**: su comportamiento depende de la carga correcta del modelo `meta-llama/Llama-3.2-1B-Instruct`, que requiere aceptar su licencia propia (Llama 3.2 Community License).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cooleytukey/dummy-taboo-lora-llama-3.2-1b-banana
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Referencia a la colección LoRA taboo: https://huggingface.co/bcywinski/llama-3.1-8b-instruct-taboo-* (no se ha podido verificar el enlace exacto)
