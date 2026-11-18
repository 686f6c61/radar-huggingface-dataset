# ccore/Qwen3-1.7B-GLB-3D-Coder

## Resumen

CCORE GLB-3D-Coder 1.7B es un ajuste fino de Qwen3-1.7B desarrollado por el usuario ccore, especializado en la generación de activos 3D low-poly exportables como archivos GLB. El modelo escribe páginas HTML completas y autónomas que utilizan Three.js para renderizar un activo 3D interactivo, e incluyen un botón de exportación que descarga el GLB resultante, pensado para su uso en el editor Godot. Resuelve un problema muy concreto: producir geometría 3D funcional a partir de una descripción en lenguaje natural en hardware modesto.

La arquitectura subyacente es la de Qwen3, un transformer causal con atención completa y grouped-query attention en las 28 capas, con 1.720.574.976 parámetros totales. El ajuste se realizó sobre el dataset propio ccore/ThreeJS-3D-GLB-Assets, que cubre 40 dominios de activos (personajes, mobiliario, entornos, vehículos, mecánicas interactivas, etc.).

Su relevancia actual radica en la accesibilidad: al ser un modelo de 1.7B, las cuantizaciones GGUF caben en CPU o en GPUs de gama baja, con un archivo Q8_0 de aproximadamente 1,83 GB. Esto permite un bucle de iteración corto para creadores sin GPU dedicada, algo poco habitual en tareas de generación de código 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3) con atención completa y grouped-query attention en 28 capas |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16; pesos FP16 en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M, Q8_0, F16) y safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer causal denso con 28 capas y grouped-query attention, y se ha ajustado mediante fine-tuning supervisado sobre el dataset ccore/ThreeJS-3D-GLB-Assets. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el objetivo era mantener atención causal completa en todas las capas para preservar la coherencia del código generado.

El dataset cubre 40 dominios de activos 3D, organizados en cinco grandes categorías: personajes y criaturas (NPCs, enemigos, jefes, robots), objetos y props (armas, mobiliario, electrodomésticos, instrumentos), entornos y estructuras (arquitectura modular, escenarios de batalla, estructuras submarinas), vehículos y máquinas (transporte terrestre, aéreo, marítimo, maquinaria industrial) y activos interactivos (trampas, puzles, marcadores de gameplay). El modelo genera HTML con Three.js y un botón de exportación GLB, e incorpora animación en el GLB cuando el activo la requiere.

## Capacidades

- Generación de código: produce páginas HTML completas y autónomas con Three.js que renderizan un activo 3D interactivo.
- Exportación GLB: incluye un botón que descarga el activo en formato GLB listo para importar en Godot u otros editores 3D.
- Modelado low-poly: genera geometría de baja poligonización con materiales, colores y estructuras coherentes con la descripción.
- Animación opcional: añade animaciones al GLB exportado cuando el activo lo requiere; en caso contrario, lo genera estático.
- Generación de texto conversacional: hereda la capacidad de diálogo de Qwen3-1.7B.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Prototipado rápido de activos para Godot: un desarrollador describe un objeto ("mesa de hierro low-poly con remaches y estante inferior") y obtiene un HTML con el activo renderizado y un GLB exportable, reduciendo el tiempo de bloqueo en la fase de preproducción.
- Creación de escenarios de juego: el modelo genera comandos, campamentos y estructuras completas (puesto de mando en la jungla, campamento goblin helado) con varios elementos combinados, útiles para vestir niveles sin modelador.
- Generación de props y mobiliario: activos como mostradores de panadería, mesas o electrodomésticos se producen a partir de una frase, adecuados para catálogos de assets o tiendas de complementos.
- Personajes y enemigos low-poly: jefes como un gólem de piedra con núcleo de cristal, o criaturas y NPCs, para prototipos de gameplay o maquetas de combate.
- Iteración en hardware modesto: con el GGUF Q8_0 (1,83 GB) el modelo corre en CPU o en GPUs de gama baja, lo que permite probar variantes de un activo en un portátil sin GPU dedicada.
- Educación y aprendizaje de Three.js: el HTML generado sirve como ejemplo funcional de escena Three.js con exportación GLB, útil para quienes estudian gráficos web.
- Generación de activos animados: cuando el activo requiere animación, el modelo la incorpora al GLB, lo que sirve para elementos interactivos como trampas o marcadores de gameplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa aproximadamente 1,83 GB; el F16, unos 3,45 GB; el Q4_K_M, unos 1,11 GB. La VRAM necesaria para inferencia debe sumar el espacio del contexto y del runtime.
- GPU recomendadas: no se especifican modelos concretos; el autor orienta el modelo a CPU o GPUs de baja VRAM.
- Cabe en GPU de consumo: sí, por tamaño (1,7B de parámetros), en tarjetas con suficiente VRAM para el archivo elegido; el Q8_0 está pensado para CPU o baja VRAM.
- Opciones de despliegue: llama.cpp y LM Studio (runtimes compatibles con Qwen3); los pesos safetensors FP16 permiten su uso con Transformers.
- Latencia y throughput: no disponibles; el autor indica que la velocidad de generación depende del hardware, el runtime, la longitud de contexto y la cantidad de código que escriba el modelo.
- Calidad por cuantización: el autor señala que Q4_K_M produce resultados sustancialmente peores; recomienda F16 o Q8_0, siendo Q8_0 el punto de partida sugerido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CCORE GLB-3D-Coder 1.7B | 1,72B | no disponible | Generacion de activos 3D GLB con Three.js | Apache 2.0 | GGUF y safetensors en HF |
| Qwen3-1.7B (base) | 1,72B | no disponible | Proposito general, texto y codigo | Apache 2.0 | HF |
| Alternativas especializadas en codigo 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- Fiabilidad de generación: según el autor, el modelo suele producir un activo 3D, pero algunos intentos fallan al renderizar o al exportar el GLB y requieren reintento.
- Cuantización: Q4_K_M degrada sustancialmente la calidad; para uso serio se recomienda Q8_0 o F16.
- Contexto e idiomas: no se documenta la longitud de contexto ni los idiomas soportados; el prompt de sistema recomendado está en inglés.
- Sesgos: no se documentan sesgos específicos; al heredar Qwen3-1.7B, puede arrastrar los del modelo base.
- Alucinación: riesgo presente en la generación de código; el HTML o el GLB pueden ser sintácticamente válidos pero geométricamente incorrectos o no exportables.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B y de las dependencias generadas (Three.js).
- Producción: no hay benchmarks publicados ni métricas de latencia; validar el pipeline de exportación antes de integrarlo en flujos automatizados.
- Actualización de pesos: el autor advierte que los pesos se actualizaron el 13 de noviembre de 2026 y que las copias GGUF descargadas antes deben reemplazarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccore/Qwen3-1.7B-GLB-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Apoyo al proyecto: https://ko-fi.com/ccorecaio
