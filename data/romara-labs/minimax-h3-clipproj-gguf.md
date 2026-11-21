# romara-labs/MiniMax-H3-ClipProj-GGUF

## Resumen

MiniMax-H3-ClipProj-GGUF es un conjunto de matrices de proyección que permiten sustituir el codificador de texto Qwen3-VL-32B por variantes más pequeñas (Qwen3-VL-2B, 4B u 8B) en toda la familia MiniMax-H3. Lo publica romara-labs como conversión GGUF del proyecto original NicoLab28/ClipProj-MiniMax-H3, con el objetivo de reducir drásticamente los requisitos de memoria y cómputo del pipeline de generación de vídeo e imagen de MiniMax-H3 sin reentrenar el modelo de difusión.

El componente clave es que MiniMax-H3, MiniMax-H3-Image y P-H3-Image comparten una condicionamiento de texto de 5.120 dimensiones, de modo que una única matriz de proyección sirve para los tres modelos. El repositorio contiene seis ficheros GGUF (variantes Ridge y MLP para encoders de 4B y 8B, más dos variantes legacy para 2B) y ocupa 1,5 GB. No es un modelo generativo autónomo: requiere el modelo de difusión, el codificador de texto compatible y los VAE correspondientes, que no se incluyen.

La relevancia inmediata es práctica: permite ejecutar MiniMax-H3 en entornos con menos VRAM usando stable-diffusion.cpp (fork de Romara Labs), a costa de validar empíricamente la calidad, ya que las matrices se calibraron sobre prompts de vídeo y la calidad en texto-a-imagen no está sistemáticamente validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matrices de proyección lineal sobre embeddings de texto (variantes Ridge y MLP); arquitectura GGUF personalizada `clipproj`, no un modelo `llama.cpp` estándar |
| Parametros totales | 127.967.232 (según safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del codificador Qwen3-VL emparejado) |
| Tipos de cuantizacion | Conversión GGUF sin cuantización adicional (preserva precisión de tensores); variantes Ridge y MLP |
| Idiomas soportados | no disponibles (heredados del codificador Qwen3-VL y del modelo MiniMax-H3) |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | GGUF (ficheros `mmh3-*-ClipProj-*.gguf`) |

Ficheros incluidos:

| Fichero | Codificador compatible | Proyección |
|---|---|---|
| `mmh3-4b-ClipProj-v3.1.gguf` | Qwen3-VL-4B | Ridge |
| `mmh3-4b-ClipProj-v3.1-mlp.gguf` | Qwen3-VL-4B | MLP |
| `mmh3-8b-ClipProj-v3.1.gguf` | Qwen3-VL-8B | Ridge |
| `mmh3-8b-ClipProj-v3.1-mlp.gguf` | Qwen3-VL-8B | MLP |
| `mmh3-2b-ClipProj-v1.gguf` | Qwen3-VL-2B | Legacy v1 |
| `mmh3-2b-ClipProj-v1-mlp.gguf` | Qwen3-VL-2B | Legacy v1, MLP |

## Arquitectura y entrenamiento

No se trata de un transformer generativo, sino de un adaptador de proyección que transforma los embeddings de salida de un codificador Qwen3-VL pequeño (2B, 4B u 8B) al espacio de condicionamiento de 5.120 dimensiones que espera MiniMax-H3. Se ofrecen dos familias: proyección Ridge (lineal regularizada) y proyección MLP (perceptrón multicapa, ficheros de mayor tamaño). La serie v3.1 corresponde a los pesos de NicoLab28/ClipProj-MiniMax-H3 convertidos a GGUF preservando la precisión de los tensores, sin cuantización adicional.

Las matrices se calibraron sobre prompts de vídeo. No hay información disponible sobre el volumen de datos de calibración, la composición del dataset ni si intervinieron procesos de RLHF o DPO, ya que no se trata de un modelo entrenado por refuerzo sino de un ajuste de proyección supervisado sobre pares de embeddings. Los ficheros legacy v1 para 2B son anteriores a la serie v3.1 y su revisión exacta de origen no pudo confirmarse según la model card.

## Capacidades

- Traducción del espacio de embeddings de Qwen3-VL-2B/4B/8B al condicionamiento de 5.120 dimensiones de MiniMax-H3.
- Compatibilidad con MiniMax-H3 (vídeo), MiniMax-H3-Image y P-H3-Image con una única matriz por tamaño de codificador.
- Variantes Ridge (menor tamaño) y MLP (mayor capacidad de ajuste no lineal).
- Integración con el fork de stable-diffusion.cpp de Romara Labs mediante los flags `--llm`, `--cliproj` y `--llm_vision`.
- Prioridad de `--cliproj` sobre el conector de texto de P-H3-Image cuando ambos están presentes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio propios; la visión depende del vision tower del codificador emparejado.
- Capacidades multilingües: no disponibles de forma explícita, dependen del codificador Qwen3-VL subyacente.

## Casos de uso

- Generación de vídeo en GPU de gama media: sustituir el codificador Qwen3-VL-32B por Qwen3-VL-4B más `mmh3-4b-ClipProj-v3.1.gguf` reduce la huella de memoria del pipeline y permite ejecutar MiniMax-H3 en hardware con menos VRAM.
- Texto-a-imagen con MiniMax-H3-Image: usar la misma matriz de proyección para el pipeline de imagen, asumiendo que la calidad no está sistemáticamente validada y requiere evaluación propia.
- Experimentación con P-H3-Image: aprovechar la precedencia de `--cliproj` sobre el conector de texto nativo para probar codificadores alternativos sin modificar el grafo del modelo.
- Despliegue en entornos con CPU o GPU integrada: al ser GGUF y ejecutarse vía stable-diffusion.cpp, permite prototipado en máquinas sin aceleradores de datacenter.
- Investigación sobre compresión de codificadores de texto: comparar Ridge frente a MLP y 2B frente a 4B/8B para medir la degradación de fidelidad en la condicionamiento.
- Evaluación comparativa de encoders: mantener varias matrices en disco (1,5 GB total) y alternar codificadores según presupuesto de latencia en pipelines de generación por lotes.
- Reproducibilidad de investigación: partir de los pesos originales de NicoLab28 y verificar la conversión GGUF sin pérdida de precisión de tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del codificador emparejado (Qwen3-VL-2B/4B/8B), del modelo de difusión MiniMax-H3 y de los VAE, ninguno incluido en este repo.
- GPU recomendadas: no disponible. El repo no documenta perfiles de hardware objetivo.
- Compatibilidad con GPU de consumo: plausible al usar codificadores de 2B/4B/8B en GGUF, pero sin datos de VRAM publicados por el autor.
- Opciones de despliegue: fork de Romara Labs de stable-diffusion.cpp (instrucciones de compilación con patch en `github.com/romara-labs/stable-diffusion.cpp/tree/master/patch`). No es compatible con `llama.cpp` estándar por la arquitectura GGUF personalizada `clipproj`.
- Flags de ejecución: `--llm /ruta/qwen3-vl-4b.gguf --cliproj /ruta/mmh3-4b-ClipProj-v3.1.gguf`, y `--llm_vision` si el vision tower se almacena por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| romara-labs/MiniMax-H3-ClipProj-GGUF | Adaptador de proyección GGUF | 127.967.232 | no disponible | MiniMax H3 Community License | Hugging Face, 0 descargas |
| NicoLab28/ClipProj-MiniMax-H3 | Proyección original (formato nativo) | no disponible | no disponible | MiniMax H3 Community License (según repo derivado) | Hugging Face |
| Qwen3-VL-32B (codificador original) | Codificador de texto/visión | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| Qwen3-VL-4B-Instruct (codificador sustituto) | Codificador de texto/visión | no disponible en esta ficha | no disponible | no disponible | Hugging Face |

La comparación relevante no es frente a otros modelos generativos, sino frente al codificador original de 32B que este adaptador permite evitar. No hay datos de rendimiento publicados para cuantificar la pérdida de calidad.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo de difusión MiniMax-H3, el codificador compatible y los VAE no genera nada.
- Las matrices se calibraron sobre prompts de vídeo; la calidad en texto-a-imagen no está sistemáticamente validada.
- Los flujos con imagen o vídeo de referencia no están validados en este repositorio.
- Los ficheros legacy v1 para 2B tienen compatibilidad de runtime y revisión de origen no verificadas.
- La arquitectura GGUF `clipproj` es personalizada y no funciona en `llama.cpp` estándar; requiere el fork de Romara Labs.
- Licencia MiniMax H3 Community License Agreement: revisar términos antes de uso comercial o redistribución; no es una licencia permisiva tipo Apache o MIT.
- Sesgos y riesgo de alucinación: no aplicables de forma directa al ser un adaptador, pero heredados del codificador y del modelo de difusión subyacentes.
- Sin datos publicados de benchmarks, VRAM, latencia ni idiomas: cualquier decisión de producción exige evaluación empírica propia.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/romara-labs/MiniMax-H3-ClipProj-GGUF
- Proyecto original de proyecciones: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Modelo base de difusión: https://huggingface.co/Comfy-Org/MiniMax-H3
- Codificador de referencia: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Fork de stable-diffusion.cpp: https://github.com/romara-labs/stable-diffusion.cpp
- Instrucciones de compilación con patch: https://github.com/romara-labs/stable-diffusion.cpp/tree/master/patch
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
