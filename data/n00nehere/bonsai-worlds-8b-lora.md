# n00nehere/bonsai-worlds-8b-lora

## Resumen

Bonsai Worlds 8B es un adaptador LoRA de rango 32 publicado por el usuario n00nehere sobre el modelo base prism-ml/Bonsai-8B-unpacked. No es un modelo autónomo: es un fichero adaptador que se carga junto al checkpoint base ya cuantizado (`Bonsai-8B-Q1_0.gguf`) mediante el runtime PrismML, una bifurcación de llama.cpp. Su única función es generar contenido procedural estructurado para un juego de plataformas: planes de nivel compactos, powerups con habilidades y modificadores restringidos, y en menor medida rejillas completas de tiles.

La relevancia del proyecto es de nicho y muy concreta: demuestra un flujo de generación procedural asistida por un LLM de 8B ejecutándose en local, con decodificación restringida por gramática JSON y validación determinista posterior. El adaptador ocupa 174.622.912 bytes en F16 (87.293.952 parámetros) y se aplica sobre el base sin fusionarse ni recuantizarse; el base cuantizado en Q1_0 ronda 1,16 GB, de modo que el conjunto completo cabe en dispositivos de gama baja, incluido Android.

El entrenamiento se hizo con Unsloth sobre una única H100 de Modal, con la base congelada en BF16 y la pérdida calculada solo sobre la respuesta. El corpus sintético auditado contiene 250.000 ejemplos. Las métricas publicadas son de aceptación, no de benchmarks académicos: la pérdida en held-out (128 ejemplos) baja de 2,185389 a 0,179760, y en inferencia nativa con la base Q1_0 se obtienen 16/16 planes válidos y 12/12 powerups válidos. El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso Bonsai-8B; rango 32, alpha 64, aplicado a proyecciones de atención y MLP |
| Parametros totales | 87.293.952 parámetros del adaptador (safetensors); el modelo base aporta 8.188.548.096 valores |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento; todas las conversaciones del dataset caben sin truncado) |
| Tipos de cuantizacion | Adaptador en GGUF F16; base en GGUF Q1_0 (aproximadamente 1 bit por peso). No se publican otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (base y adaptador) |
| Formato de pesos | GGUF (`bonsai-forge-lora-f16.gguf`) y safetensors en el repositorio; el adaptador nunca se fusiona ni se recuantiza en Q1 |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de rango 32 y alpha 64 (factor de escala alpha/r = 2) sobre las proyecciones de atención y MLP del transformer Bonsai-8B. La base se mantiene congelada en almacenamiento y cómputo BF16, mientras que los valores entrenables del LoRA se mantienen en FP32. El entrenamiento se ejecutó con Unsloth sobre una única GPU H100 en Modal, con pérdida calculada únicamente sobre la respuesta (response-only loss), contexto de 2.048 tokens, learning rate 0,0002, batch 4 con acumulación de gradiente 4 (lote efectivo 16) y un total de 1.000 pasos de optimizador equivalentes a 16.000 presentaciones de ejemplo, menos de una época completa del corpus.

El corpus sintético auditado tiene 250.000 ejemplos: 125.000 planes compactos, 75.000 niveles o chunks completos y 50.000 powerups, divididos en 184.156 filas de entrenamiento y 65.844 de held-out. Además de usar semillas disjuntas, se reservaron combinaciones semánticas y familias de redacción para la evaluación. La innovación técnica relevante no está en la arquitectura, sino en el flujo de uso: el modelo emite planes compactos en JSON que después se expanden con el generador geométrico determinista del propio juego, y toda la decodificación se restringe con gramáticas JSON específicas recogidas en `evidence/native-prompts.json`. Como verificación de integridad, los 399 tensores del checkpoint original (8.188.548.096 valores) superaron exactamente una ida y vuelta de almacenamiento FP16→BF16→FP16, lo que demuestra representabilidad de valores, no aritmética idéntica.

## Capacidades

- Generación de planes de nivel compactos para juegos de plataformas, en formato estructurado y con semilla reproducible.
- Generación de powerups con habilidades y modificadores acotados a las mecánicas predefinidas del juego.
- Generación de rejillas completas de tiles y chunks de nivel, aunque con calidad de aceptación muy baja (ver la sección de benchmarks): el propio autor desaconseja esta vía.
- Salida JSON conforme a gramática impuesta durante la decodificación, lo que hace el parseo determinista.
- Inferencia nativa sobre CPU y en dispositivo Android mediante el runtime PrismML (bifurcación de llama.cpp).
- Muestreo con semilla fija (sampler con grammar primero, top-k 20, top-p 0,9, temperatura 0,6), lo que permite reproducir exactamente un nivel dado.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de uso agéntico ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No genera código ejecutable ni mecánicas de juego nuevas: solo recetas estructuradas dentro de la mecánica suministrada.

## Casos de uso

- Generación procedural de niveles en un juego de plataformas 2D: el modelo produce planes compactos en JSON que la aplicación expande con su generador geométrico determinista, evitando la generación directa de rejillas completas, que no superó la evaluación.
- Integración en aplicaciones Android offline: el conjunto base Q1_0 (unos 1,16 GB) más el adaptador (174,6 MB) se ejecuta en el dispositivo con el runtime PrismML, sin depender de servicios en la nube y con importación verificada en emulador.
- Generación de powerups con restricciones de diseño: el modelo emite habilidades y modificadores dentro de un espacio acotado, útil cuando el equipo de diseño quiere variaciones controladas sin romper el balance.
- Aumento del contenido jugable para playtesting: al poder fijar la semilla, un tester puede reproducir exactamente el mismo nivel para comparar cambios en el motor o en la física del juego.
- Poblado de un catálogo de niveles con validación automática: el flujo documentado valida la salida, aplica la semilla solicitada y conserva un generador procedural etiquetado como respaldo para generaciones rechazadas o lentas, lo que permite usar el modelo como capa opcional sobre un sistema ya existente.
- Prototipado rápido de mecánicas de nivel: combinando la gramática JSON con distintos prompts se pueden explorar variantes de dificultad o de geometría antes de comprometer el diseño final.
- Generación de contenido con control de calidad en pipelines internos: la expansión JavaScript junto con comprobaciones físicas independientes en Python pasó 16/16 planes en 64 contextos finitos e infinitos sin errores de geometría, lo que da un patrón de verificación reutilizable en CI.
- Sustitución parcial de contenido manual en juegos de bajo presupuesto: para equipos pequeños que no pueden diseñar niveles a mano, el par base+adaptador ofrece una fuente de recetas estructuradas ejecutable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son métricas internas de aceptación del propio autor:

| Métrica | Antes | Después | Muestra |
|---|---|---|---|
| Pérdida en held-out | 2,185389 | 0,179760 | 128 ejemplos |
| Planes válidos (GPU, sin restricciones) | no disponible | 32/32 | 32 planes |
| Planes conformes al prompt (GPU) | no disponible | 32/32 | 32 planes |
| Powerups válidos (GPU) | no disponible | 12/12 | 12 powerups |
| Powerups conformes al prompt (GPU) | no disponible | 12/12 | 12 powerups |
| Rejillas completas válidas (generación directa) | no disponible | 1/4 | 4 rejillas |
| Rejillas completas conformes al prompt | no disponible | 0/4 | 4 rejillas |
| Planes válidos (nativo Q1 + LoRA) | no disponible | 16/16 | 16 planes |
| Planes conformes al prompt (nativo Q1 + LoRA) | no disponible | 16/16 | 16 planes |
| Powerups válidos (nativo Q1 + LoRA) | no disponible | 12/12 | 12 powerups |
| Powerups conformes al prompt (nativo Q1 + LoRA) | no disponible | 12/12 | 12 powerups |
| Expansión JS + física Python | no disponible | 16/16 planes, 0 errores de geometría | 64 contextos (finitos e infinitos) |

El propio autor advierte que son muestras pequeñas de held-out y no una garantía para prompts arbitrarios.

## Requisitos de hardware

- Peso del adaptador: 174.622.912 bytes en F16 (aproximadamente 166 MiB).
- Peso del base: el checkpoint `Bonsai-8B-Q1_0.gguf` ocupa aproximadamente 1,16 GB para 8.188.548.096 valores, lo que sitúa la tasa efectiva en el entorno de 1 bit por peso.
- Memoria total de pesos: alrededor de 1,34 GB, a lo que hay que sumar la caché de contexto y los búferes de trabajo.
- VRAM estimada para inferencia: no disponible como cifra medida; por el tamaño de los pesos, cualquier GPU con 2 GB o más de VRAM debería alojar el conjunto completo.
- GPU recomendadas: no hay recomendaciones oficiales. El entrenamiento se realizó en una H100, pero la inferencia está pensada para ejecución en CPU y en dispositivo móvil, no en GPU de datacenter.
- Cabe en GPU de consumo: sí, con margen amplio, por el reducido tamaño del base cuantizado y del adaptador. No se documentan modelos concretos probados.
- Opciones de despliegue: `PrismML-Eng/llama.cpp`, revisión `5d80cff0b8cb9f2bf823cfc4e71e3abb97f290d6`. No hay soporte documentado para vLLM, TGI, Ollama u otros servidores.
- Requisito de fijación de versiones: se debe cargar la revisión `48516770dd04643643e9f9019a2a349cf26c5dbd` del base (`Bonsai-8B-Q1_0.gguf`, SHA256 `284a335aa3fb2ced3b1b01fcb40b08aa783e3b70832767f0dd2e3fdfa134bd54`) y el adaptador con SHA256 `85cf09c4c6ddfde3c9e83a69de338a7f17a4c70e93d5a4bb83b65f9589897d63`.
- Latencia y throughput: no disponible. Los tiempos medidos en emulador y en procesos de CPU no son medidas de rendimiento en un teléfono Android físico, según indica el propio autor.

## Comparativa con modelos similares

No se han encontrado en la información disponible otros adaptadores LoRA de generación procedural de niveles directamente comparables. La única referencia contrastable es el propio modelo base sin el adaptador:

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n00nehere/bonsai-worlds-8b-lora (este adaptador) | 87.293.952 en el adaptador + 8.188.548.096 en el base | 2.048 tokens | Pérdida held-out 0,179760; 16/16 planes válidos y 12/12 powerups válidos en nativo Q1+LoRA | Apache-2.0 | Repositorio HuggingFace, 0 descargas |
| prism-ml/Bonsai-8B-unpacked (base sin adaptador) | 8.188.548.096 | no disponible | Datos de aceptación para la tarea de niveles no disponibles | Apache-2.0 | HuggingFace |
| prism-ml/Bonsai-8B-gguf (base cuantizado Q1_0) | 8.188.548.096 | no disponible | Datos de aceptación para la tarea de niveles no disponibles | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Especialización extrema: no es un modelo de propósito general ni un asistente conversacional. Fuera de la generación de planes, powerups y rejillas para el juego objetivo, su utilidad no está documentada.
- Monolingüe en inglés.
- Requiere decodificación con gramática JSON y los prompts exactos de `evidence/native-prompts.json`; sin ese condicionamiento no hay garantía de salidas parseables.
- La generación directa de rejillas completas falla de forma sistemática (1/4 válidas, 0/4 conformes al prompt). El autor desaconseja explícitamente usarla para jugabilidad.
- Riesgo de alucinación y de salidas no conformes fuera de la distribución de entrenamiento. Las evaluaciones se hicieron con muestras pequeñas (128 ejemplos de pérdida, 16-32 de aceptación) y el propio autor advierte que no garantizan comportamiento con prompts arbitrarios.
- La validación estática de rutas no demuestra la temporización dinámica de enemigos o jefes.
- Los tiempos medidos en emulador y en procesos de CPU no equivalen al rendimiento en un teléfono Android real.
- El modelo genera recetas estructuradas dentro de las mecánicas suministradas; no produce código ejecutable ni mecánicas nuevas sin restricciones.
- No incluye activos propietarios de ningún juego; el usuario debe aportar sus propias mecánicas y geometría.
- La licencia Apache-2.0 permite uso comercial, pero el adaptador depende de un runtime bifurcado de llama.cpp cuyo mantenimiento y compatibilidad no están garantizados.
- El base está cuantizado en Q1_0 (en torno a 1 bit por peso), lo que implica una pérdida de calidad potencial frente a BF16 que no se cuantifica en la documentación.
- Sin tracción comunitaria: 0 descargas y 0 likes, con lo que no existe validación independiente de los resultados publicados.
- Fijación estricta de revisiones y hashes: usar el base o el runtime equivocados invalida las comprobaciones de aceptación reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/n00nehere/bonsai-worlds-8b-lora
- Modelo base (sin cuantizar): https://huggingface.co/prism-ml/Bonsai-8B-unpacked
- Modelo base cuantizado: https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Runtime probado (bifurcación de llama.cpp): https://github.com/PrismML-Eng/llama.cpp
- Prompts y gramáticas JSON de referencia: carpeta `evidence/native-prompts.json` dentro del repositorio del modelo
- Manifiestos y hashes del dataset: carpeta `evidence/` dentro del repositorio del modelo
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados obtenidos corresponden a páginas de soporte de Microsoft y no guardan relación con esta ficha).
