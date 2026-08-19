# Jables/eschaton-eml-lm-v1

## Resumen

El modelo `Jables/eschaton-eml-lm-v1` es un checkpoint del proyecto **EML-LM**, un modelo de lenguaje desarrollado por el laboratorio de autoinvestigación `eml-autoresearch` y publicado por el usuario Jables. Está diseñado específicamente para ser cargado directamente en el navegador a través de la aplicación **EML Foundation** alojada en The Daily Synthesis, utilizando un sistema de importación en IndexedDB. El repositorio contiene dos variantes "large" en formato JSON: una con profundidad 4 y precisión f32 (59 MB) y otra con profundidad 6 y precisión int8 (35 MB). La variante principal, `eml-lm-depth4-int8.json` (15 MB), no se encuentra en este repositorio, sino que se sirve desde el propio sitio web por razones de límite de almacenamiento de GitHub Pages.

El modelo está pensado para la inferencia en el cliente, con pesos exportados mediante un script de Python (`export.py`) que garantiza paridad byte-exacta con MLX en la variante f32. No se proporcionan detalles sobre la arquitectura interna más allá de la profundidad, ni información sobre el conjunto de datos de entrenamiento, el número de parámetros o las capacidades lingüísticas. A pesar de su reciente publicación (agosto de 2026), no registra descargas ni valoraciones en HuggingFace, lo que sugiere que es un proyecto experimental o de nicho.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Desconocida (se menciona profundidad 4 o 6, sin especificar tipo de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f32 e int8 (precisión de pesos, no cuantización estándar) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | JSON (archivos `.json` con pesos serializados) |

## Arquitectura y entrenamiento

La información disponible es escasa. El modelo se describe como "EML-LM — large variants", con dos archivos de pesos: `eml-lm-default.json` (profundidad 4, f32, val_bpb 2.348) y `eml-lm-depth6-int8.json` (profundidad 6, int8, val_bpb 2.564). La profundidad se refiere al número de capas, pero no se indica el tipo de arquitectura (transformer, SSM, etc.). El entrenamiento fue realizado por un sistema de autoinvestigación (`eml-autoresearch`), lo que sugiere un proceso automatizado, pero no se detallan los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La exportación se realiza con un script propio (`export.py`) que produce archivos JSON compatibles con el almacenamiento del navegador, y se menciona que la variante f32 tiene "paridad byte-exacta con MLX", lo que indica una reproducibilidad precisa de los pesos.

## Capacidades

No se documentan capacidades específicas en la model card. No hay información sobre generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte de agentes o capacidades multilingües. Dado el tamaño reducido de los archivos (15–59 MB) y su orientación a navegador, es probable que el modelo esté limitado a tareas de lenguaje básicas, pero esto es una inferencia no confirmada.

## Casos de uso

No se proporcionan casos de uso documentados. El diseño del modelo, orientado a la carga en navegador vía IndexedDB, sugiere aplicaciones de inferencia ligera en el cliente, como:

- Demostraciones interactivas de generación de texto en páginas web.
- Prototipos de asistentes conversacionales que no requieran servidor.
- Experimentación educativa con modelos de lenguaje pequeños.
- Integración en aplicaciones de escritorio basadas en tecnologías web (Electron, Tauri).
- Pruebas de concepto para inferencia sin conexión en dispositivos con recursos limitados.

Sin embargo, al no existir documentación adicional, estos usos son hipotéticos y no están validados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica mencionada es el `val_bpb` (bits por byte de validación), que es una medida de compresión del modelo: 2.348 para la variante f32 y 2.564 para la int8. Este valor no es comparable directamente con benchmarks estándar como MMLU o HumanEval, y no se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

Dado que el modelo está diseñado para ejecutarse en el navegador y los archivos de pesos son de entre 15 y 59 MB, los requisitos de hardware son mínimos:

- Se puede ejecutar en cualquier CPU moderna sin necesidad de GPU.
- La memoria RAM necesaria es inferior a 100 MB para los pesos, más el overhead del runtime JavaScript.
- No se requieren tarjetas gráficas dedicadas.
- El despliegue se realiza mediante el script `eml-foundation/eml-lm-store.js`, que importa los pesos directamente en IndexedDB del navegador.
- No se dispone de datos sobre latencia o throughput, pero al ser un modelo pequeño, se espera una generación de texto en tiempo real en dispositivos convencionales.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables en la misma categoría (modelos de lenguaje pequeños para navegador). El proyecto parece ser único en su enfoque de exportación a JSON para IndexedDB, aunque existen otros modelos ligeros como TinyLlama o phi-3-mini, pero no se dispone de datos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones lingüísticas.
- El modelo es extremadamente pequeño (15–59 MB), lo que limita su capacidad de razonamiento complejo y su calidad en tareas avanzadas.
- La arquitectura interna no está documentada, lo que dificulta evaluar su comportamiento.
- No hay garantías de soporte o mantenimiento; el proyecto parece experimental.
- Aunque la licencia MIT permite uso comercial, no se especifican restricciones adicionales ni se proporciona un modelo de responsabilidad.
- El formato de pesos JSON no es estándar en la industria (no es safetensors ni GGUF), lo que puede dificultar su integración con frameworks comunes como transformers o llama.cpp.

## Enlaces

- [HuggingFace: Jables/eschaton-eml-lm-v1](https://huggingface.co/Jables/eschaton-eml-lm-v1)
- [The Daily Synthesis - EML Foundation](https://johnjboren.github.io/eml-foundation.html)
