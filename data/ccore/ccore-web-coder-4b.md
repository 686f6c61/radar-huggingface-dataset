# ccore/CCORE-Web-Coder-4B

## Resumen

CCORE Web Coder 4B es un ajuste fino (finetune) del modelo base Qwen3.5-4B-Base, desarrollado por CCORE (ccore). El modelo está especializado en convertir un *brief* textual en un único documento HTML con React embebido, destinado a construir sitios web, presentaciones de diapositivas o páginas informativas que se renderizan directamente en el navegador sin necesidad de paso de compilación.

El modelo resuelve un problema muy concreto: la generación de artefactos web completos y autocontenidos a partir de una descripción breve, cargando React 18.3.1, ReactDOM y Babel standalone desde CDN de jsDelivr. Con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), se sitúa en la franja de modelos pequeños que pueden ejecutarse en hardware de consumo.

La versión publicada es un *checkpoint preview* entrenado con aproximadamente el 26 % de los tokens de entrenamiento proyectados, distribuido únicamente en formato GGUF Q8_0 (4,48 GB). El autor ha anunciado una release completa con safetensors y más cuantizaciones para el 22 de noviembre de 2026, y la publicación del dataset para el 25 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); otras cuantizaciones anunciadas para la release completa |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q8_0); safetensors anunciado para la release completa |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer de aproximadamente 4,2 mil millones de parámetros, y se ajusta mediante finetune supervisado para una tarea de generación de documentos HTML completos con React. La model card no detalla la composición del dataset de entrenamiento, el número exacto de tokens consumidos ni si se aplicaron técnicas de RLHF o DPO; únicamente indica que el checkpoint preview corresponde aproximadamente al 26 % de los tokens de entrenamiento proyectados. El dataset de entrenamiento está previsto para publicación el 25 de noviembre de 2026.

La innovación principal no reside en la arquitectura, sino en el formato de salida: el modelo se entrena para producir un único documento HTML, desde `<!doctype html>` hasta `</html>`, con todo el CSS en un bloque `` y todo el JSX en un bloque `
