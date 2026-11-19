# ggml-org-dev/tiny-d1-2B-for-testing-GGUF

## Resumen

`tiny-d1-2B-for-testing-GGUF` es un artefacto de prueba publicado por `ggml-org-dev`, el espacio de organizacion usado por el equipo de llama.cpp. No es un modelo pensado para uso real: la propia model card lo describe como una copia "modificada y danada" de `LiquidAI/d1-2B` cuyo output es gibberish (texto sin sentido). Su unica finalidad es servir de fixture en las pruebas automatizadas del servidor de llama.cpp, concretamente para el tipo de decision `lfm3-d1`.

El modelo base es `ggml-org-dev/tiny-d1-2B-for-testing`, un derivado de la familia d1 de Liquid AI (arquitectura de "decision model" conversacional). Aunque el nombre comercial sugiere 2B parametros, el recuento real en safetensors es de 34.481.472 parametros (aproximadamente 34,5 M), lo que confirma que se trata de una version truncada o reducida artificialmente para que las pruebas sean rapidas y ligeras.

La relevancia de esta ficha es acotada: sirve para documentar que el repositorio existe, que su licencia es LFM Open License v1.0 y que **no debe emplearse en produccion ni en evaluacion de capacidades**. Cualquier uso distinto del testing de software dara resultados invalidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI d1, tipo "decision model" conversacional; la model card no detalla la arquitectura interna) |
| Parametros totales | 34.481.472 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada); el proceso de conversion uso F16 para el modelo de texto y el mmproj antes de cuantizar |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (texto + mmproj) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original `LiquidAI/d1-2B` en la documentacion proporcionada, mas alla de que se trata de un "decision model" conversacional de la familia d1 de Liquid AI. El repositorio incluye un componente `mmproj`, lo que sugiere soporte de proyeccion multimodal en el modelo base, aunque no se detalla su funcionamiento.

El proceso de generacion de este artefacto esta documentado: se convirtio el modelo base `ggml-org-dev/tiny-d1-2B-for-testing` con `convert_hf_to_gguf.py` de llama.cpp, manteniendo el modelo de texto y el mmproj en F16, y posteriormente se cuantizo el modelo de texto a Q8_0 con `llama-quantize`. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO). La model card advierte explicitamente que el modelo ha sido "modificado y danado" para que produzca salida sin sentido, por lo que cualquier capacidad del modelo original ha sido deliberadamente degradada.

## Capacidades

- **Testing de software**: es la unica capacidad funcional real. Se usa como fixture en las pruebas del servidor de llama.cpp para el tipo de decision `lfm3-d1`.
- **Generacion de texto**: tecnicamente genera texto, pero la model card indica que la salida es gibberish, por lo que no es una capacidad utilizable.
- **Tool calling / function calling**: no disponible.
- **Agentes y razonamiento multi-paso**: no disponible.
- **Capacidades multilingues**: no disponible.
- **Capacidades especiales** (thinking mode, vision, audio): no disponible. La presencia de `mmproj` sugiere vision en el modelo base, pero no se confirma ni se detalla.

## Casos de uso

- **Pruebas de integracion de llama.cpp**: el caso de uso documentado. Se lanza con `llama-server -hf ggml-org-dev/tiny-d1-2B-for-testing-GGUF:Q8_0` para validar el flujo de carga y el comportamiento del tipo de decision `lfm3-d1` en el servidor. Es adecuado porque su tamano minimo permite ejecutar tests en CI sin GPU dedicada.
- **Validacion de pipelines de conversion GGUF**: sirve para comprobar que `convert_hf_to_gguf.py` y `llama-quantize` producen artefactos cargables, dado que el repositorio documenta exactamente ese proceso (F16 a Q8_0).
- **Pruebas de regresion del parser de chat y del servidor HTTP**: al ser un modelo conversacional de la familia d1, permite ejercitar las rutas de chat completion del servidor sin coste computacional.
- **Smoke tests en entornos de desarrollo**: util para verificar que una instalacion de llama.cpp compila, arranca y sirve peticiones antes de desplegar modelos reales.
- **Reproduccion de bugs reportados**: al ser un artefacto fijo y pequeno, permite reproducir incidencias del servidor de forma determinista y compartible.
- **Documentacion de referencia de formatos**: el par texto + mmproj en GGUF sirve como ejemplo de estructura de repositorio para quienes conviertan modelos multimodales.

En ningun caso debe usarse para atencion al cliente, generacion de codigo, analisis de documentos ni ninguna tarea de produccion: la salida es invalida por diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que la salida es gibberish, por lo que cualquier metrica de calidad seria irrelevante o enganosa.

## Requisitos de hardware

- **VRAM estimada**: con 34,5 M parametros en Q8_0, el peso del modelo ronda los 35 MB; la huella total en memoria es inferior a 1 GB incluyendo overhead del runtime y el mmproj en F16.
- **GPU recomendadas**: ninguna en particular; cabe en cualquier GPU consumer, e incluso en CPU.
- **Consumer GPU**: si, en cualquier GPU con al menos 1 GB de VRAM libre (GTX 1050, RTX 3050, integradas modernas). Tambien funciona en CPU pura.
- **Opciones de despliegue**: llama.cpp (`llama-server`, `llama-cli`), y por extension cualquier runtime compatible con GGUF. El comando documentado es `llama-server -hf ggml-org-dev/tiny-d1-2B-for-testing-GGUF:Q8_0`.
- **Latencia y throughput**: no disponibles de forma oficial; por el tamano, la latencia sera de milisegundos en hardware moderno, pero sin valor practico al ser la salida invalida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ggml-org-dev/tiny-d1-2B-for-testing-GGUF` | 34,5 M (real) | no disponible | Fixture de testing | LFM Open License v1.0 | Hugging Face (GGUF) |
| `LiquidAI/d1-2B` | no disponible en la informacion | no disponible | Modelo conversacional real | LFM Open License v1.0 | Hugging Face |
| `ggml-org-dev/tiny-d1-2B-for-testing` | 34,5 M (real) | no disponible | Version safetensors del fixture | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar; la unica comparacion significativa es que este artefacto es una version deliberadamente degradada del modelo Liquid AI d1-2B, y que su version safetensors es el origen de la conversion GGUF.

## Limitaciones y advertencias

- **Salida invalida por diseno**: la model card afirma explicitamente que el output es gibberish. No es un defecto corregible; es el proposito del artefacto.
- **No apto para produccion**: no debe desplegarse en ninguna aplicacion de usuario final, evaluacion de calidad ni benchmark.
- **Sesgos**: no evaluables, dado que la salida carece de contenido semantico.
- **Riesgo de alucinacion**: total, al no producir texto coherente.
- **Limitaciones de contexto e idioma**: no documentadas; al ser un modelo truncado, no representan las del modelo original.
- **Licencia**: LFM Open License v1.0. Aunque permite uso comercial en el modelo original, este artefacto derivado conserva la licencia pero carece de utilidad comercial. Conviene revisar el fichero `LICENSE` del repositorio para los terminos exactos.
- **Nombre enganoso**: el sufijo "2B" no refleja el tamano real (34,5 M). Cualquiera que lo descargue esperando un modelo de 2B parametros se llevara una sorpresa.
- **Caveat de integridad**: al ser una copia "danada", no debe usarse para validar la calidad del modelo Liquid AI d1-2B ni para inferir sus capacidades.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ggml-org-dev/tiny-d1-2B-for-testing-GGUF
- Modelo base (safetensors): https://huggingface.co/ggml-org-dev/tiny-d1-2B-for-testing
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/d1-2B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
