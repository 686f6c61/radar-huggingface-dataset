# prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino independiente de Qwen3.5-4B desarrollado por el usuario ccore, orientado a generacion de codigo de proposito general y a la creacion de escenas 3D interactivas autocontenidas mediante Three.js (HTML y JavaScript). El modelo parte de la base Qwen3.5-4B, con 4.205.751.296 parametros totales, y se distribuye en este repositorio como una coleccion de cuantizaciones GGUF mantenida por prithivMLmods, junto con el proyector multimodal mmproj en BF16.

La relevancia de esta publicacion radica en su especializacion: no es un modelo de codigo generico, sino un fine-tune entrenado sobre el dataset ccore/ThreeJS-3D-Scenes (4.146 ejemplos con prompts, trazas de razonamiento, codigo completo y etiquetas de complejidad), lo que lo hace util para prototipado rapido de visualizaciones 3D en navegador sin dependencias externas. El repositorio incluye pesos FP16 safetensors, builds GGUF en Q3, Q4, Q5, Q6, Q8 y BF16, y un informe tecnico.

El modelo se publica bajo licencia Apache-2.0 y declara soporte unicamente para ingles. Su pipeline declarado es image-text-to-text, aunque la model card no detalla arquitectura interna, longitud de contexto ni proceso de entrenamiento mas alla del dataset citado. El autor advierte que se trata de una preview temprana y que algunas generaciones pueden requerir reintentos o correcciones menores de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-4B; transformer, detalles no publicados) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_L, mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16), GGUF, mmproj GGUF |

## Arquitectura y entrenamiento

No se publican detalles de la arquitectura interna en la informacion disponible. El modelo deriva de Qwen3.5-4B y se distribuye con un proyector multimodal (`mmproj-bf16.gguf`, 676 MB), lo que sugiere capacidad de entrada de imagen ademas de texto, coherente con el pipeline image-text-to-text declarado. El repositorio incluye tambien un archivo de safetensors FP16 y un informe tecnico referenciado en la model card.

El entrenamiento se realizo sobre el dataset ccore/ThreeJS-3D-Scenes, con licencia MIT, compuesto por 4.146 ejemplos que incluyen prompts, trazas de razonamiento, codigo completo y etiquetas de complejidad. No se especifican el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor menciona un checkpoint del 27 de octubre que, segun se reporta, mejora la generacion one-shot y la calidad de las escenas. La model card indica explicitamente que no se emplea decodificacion especulativa MTP en esta version; existe una variante separada con MTP repack.

## Capacidades

- Generacion de codigo de proposito general, con especial enfasis en JavaScript y HTML autocontenido.
- Generacion de escenas 3D interactivas mediante Three.js, incluyendo geometria, materiales, iluminacion y logica de animacion.
- Trazas de razonamiento asociadas a la generacion de codigo (el dataset de entrenamiento incluye reasoning traces).
- Entrada multimodal de imagen y texto segun el pipeline declarado y la presencia del proyector mmproj.
- Generacion de codigo one-shot para escenas de complejidad variable, con etiquetas de complejidad en el dataset de entrenamiento.
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con text-generation-inference.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agente multi-paso.

## Casos de uso

- Prototipado de visualizaciones 3D en navegador: el modelo genera archivos HTML con Three.js autocontenidos, lo que permite crear demos interactivas sin instalar dependencias ni configurar un bundler.
- Generacion de escenas 3D para educacion: a partir de una descripcion textual, produce una escena navegable que ilustra conceptos de geometria, fisica o anatomia, aprovechando el entrenamiento sobre escenas etiquetadas por complejidad.
- Integracion en herramientas de autoría web: el codigo generado puede insertarse en editores o CMS como bloque embebible, ya que el modelo tiende a producir HTML y JavaScript sin dependencias externas mas alla del CDN de Three.js.
- Generacion de codigo asistida en entornos de desarrollo: el modelo puede emplearse para autocompletar o generar fragmentos de JavaScript y HTML en pipelines de CI/CD o en asistentes de IDE, siempre con revision humana dado el caracter de preview.
- Creacion de maquetas 3D para presentaciones y marketing: a partir de un prompt descriptivo se obtiene una escena preliminar que sirve como base para iteracion visual, reduciendo el tiempo de arranque de un disenador tecnico.
- Experimentacion con modelos multimodales en local: la combinacion de GGUF y mmproj permite desplegar el modelo con llama.cpp u Ollama en equipos de consumo, facilitando pruebas de entrada imagen-texto sin GPU de datacenter.
- Generacion de contenido interactivo para juegos o experiencias web: el modelo puede producir escenas con logica de interaccion basica que sirven como punto de partida para prototipos de gameplay o exposiciones virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion se demuestra mediante escenas 3D de ejemplo y que no se proporcionan resultados cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): BF16 ~8,42 GB; Q8_0 ~4,48 GB; Q6_K ~3,46 GB; Q5_K_M ~3,07 GB; Q5_K_S ~2,99 GB; Q4_K_M ~2,71 GB; Q4_K_S ~2,56 GB; Q3_K_M ~2,26 GB; Q3_K_L ~2,42 GB; proyector multimodal mmproj-bf16 ~676 MB adicionales si se usa entrada de imagen.
- Cabe en GPU de consumo: si. Con Q4_K_M (~2,71 GB) o Q5_K_M (~3,07 GB) funciona en tarjetas de 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Con Q8_0 (~4,48 GB) requiere al menos 6 GB libres; BF16 requiere ~10 GB o mas para dejar margen de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones altas y contextos largos; A100 o H100 no son necesarias dado el tamano del modelo.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF), Ollama, LM Studio (el autor recomienda desactivar multi-token prediction en LM Studio), text-generation-inference (tag declarado), transformers con safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder (este) | 4.205.751.296 | no disponible | Apache-2.0 | safetensors, GGUF | Fine-tune especializado en Three.js y escenas 3D |
| Qwen3.5-4B (base) | ~4B (no confirmado en la informacion) | no disponible | no disponible | no disponible | Modelo base del que deriva este fine-tune; capacidades generales no especializadas en 3D |
| Qwen3.5-4B-3D-Coder-MTP-Repacked | mismo tamano | no disponible | Apache-2.0 | GGUF | Variante con decodificacion especulativa MTP repack, indicada en la model card como version alternativa |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo en preview temprana: el autor advierte que algunas generaciones pueden requerir reintentos o correcciones menores de codigo.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta evaluar su calidad relativa.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o codigo de gran extension.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un fine-tune sobre un dataset especifico de escenas Three.js, puede presentar sesgo hacia ese dominio y degradar en otras tareas de codigo.
- Riesgo de alucinacion: el modelo puede generar APIs de Three.js inexistentes o codigo que no compila; se recomienda validacion automatica en produccion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el dataset de entrenamiento (ccore/ThreeJS-3D-Scenes) tiene licencia MIT; conviene verificar la procedencia de los datos antes de un despliegue comercial.
- Configuracion de inferencia: en LM Studio debe desactivarse multi-token prediction; para decodificacion especulativa existe una variante separada (MTP-Repacked).
- Soporte de tool calling y agentes no documentado: no debe asumirse en pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Variante MTP-Repacked: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-MTP-Repacked
- Dataset de entrenamiento: ccore/ThreeJS-3D-Scenes (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- llama.cpp: https://github.com/ggml-org/llama.cpp
