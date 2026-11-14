# orz99/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Coder-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Coder-Strata-GGUF es un artefacto derivado del modelo Qwen3.8-Flash-Next, publicado por el usuario orz99 sobre el trabajo de cuantización y poda de expertos del ISTA-DASLab. El modelo base original es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen, con 176.900 millones de parámetros totales, del cual el ISTA-DASLab ha conservado únicamente 256 de los 512 expertos por capa (seleccionados sobre datos de código, agentes y visión) y ha almacenado los pesos resultantes a 3,5 bits mediante las técnicas GSQ y RCO. El resultado son 116.500 millones de parámetros efectivos (60.400 millones en los expertos, 51.200 millones en la tabla n-gram y 4.900 millones en el resto del transformer), empaquetados en GGUF de 58,4 GB frente a los 83,6 GB de la versión IQ3_S sin podar.

La contribución específica de este repositorio es la verificación de que la dirección de rechazo (refusal direction) extraída por huihui-ai del checkpoint completo sigue funcionando sobre el modelo podado, y su aplicación en tiempo de ejecución mediante el runtime Strata de Niko1221, que proyecta el vector de control fuera del residual stream capa a capa. Los pesos no se modifican: la neutralización del rechazo se consigue con una proyección `h = h - (h·r)r` aplicada en las capas indicadas (4-44 o 1-47), configurable mediante el flag `experimental_speed_projection`. El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva el proyector de visión del modelo original.

El interés de esta ficha es doble: por un lado documenta una de las primeras aplicaciones prácticas de poda selectiva de expertos combinada con cuantización extrema sobre un MoE de gran tamaño, con pérdidas declaradas del 8,7 % en SWE-bench Verified y del 1,3 % en LiveCodeBench v6 respecto al modelo completo; por otro, ilustra un patrón de despliegue en el que la modificación de comportamiento se externaliza al runtime en lugar de requerir un checkpoint nuevo, lo que reduce costes de almacenamiento y permite desactivar la proyección para recuperar el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con poda de expertos y proyector de visión |
| Parámetros totales | 176.900 millones (modelo original); 116.500 millones tras poda (según formas de tensor) |
| Parámetros activos | 60.400 millones en expertos + 4.900 millones en resto del transformer + 51.200 millones en tabla n-gram |
| Longitud de contexto | Probado hasta 262.144 tokens (8.346 expertos residentes en VRAM a esa longitud); probado también a 65.536 |
| Tipos de cuantización | GGUF a 3,5 bits (GSQ-RCO); variante IQ1_M mencionada en el setup; IQ3_S como referencia sin podar |
| Idiomas soportados | No disponible; la model card advierte que el rendimiento en idiomas distintos del inglés empeora tras la poda |
| Licencia | qwen-community-license-1.0 (license: other) |
| Formato de pesos | GGUF (dos shards + proyector de visión BF16) |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE con 512 expertos por capa en el checkpoint original. ISTA-DASLab aplica GSQ (cuantización con escala de grupo) y RCO (una técnica de compensación/rotación descrita en arXiv:2605.00649) junto con una poda que retiene 256 expertos por capa, seleccionados según su relevancia sobre datos de código, agentes y visión. Los pesos conservados se almacenan a 3,5 bits. La tabla n-gram de 51.200 millones de parámetros se mantiene intacta y es idéntica entre la versión podada y la completa, igual que el proyector de visión, lo que permite reutilizar el shard 2 y el `mmproj` si ya se dispone de una variante sin podar.

La innovación de este repositorio concreto no está en el entrenamiento, sino en el despliegue: Strata aplica una proyección de vector de control en tiempo de ejecución sobre el residual stream, usando la dirección unitaria `r` extraída por huihui-ai mediante una edición de rango uno sobre 144 tensores de escritura residual del modelo completo. La hipótesis era que la dirección podría no transferirse a un modelo con la mitad de los expertos escritores; el autor declara haberlo medido y confirmado que sí se transfiere. Adicionalmente, Strata incorpora decodificación especulativa mediante una capa MTP (multi-token prediction) descargada del checkpoint original de Qwen (unos 6 GB) y arrancada con `--spec-min-p 0.7`.

## Capacidades

- Generación de texto y razonamiento general, con calidad degradada fuera del dominio de código según la propia model card.
- Generación y edición de código, con soporte para tareas de resolución de issues reales (SWE-bench Verified) y benchmarks de programación competitiva (LiveCodeBench v6).
- Capacidades agénticas: el modelo fue podado seleccionando expertos sobre datos de agentes, lo que preserva comportamiento multi-paso.
- Visión: pipeline image-text-to-text, con proyector BF16 conservado del modelo original y ejecución en GPU configurable (`--vision gpu`).
- Decodificación especulativa con capa MTP integrada en el runtime Strata.
- Modificación de comportamiento en tiempo de ejecución: proyección de la dirección de rechazo activable o desactivable mediante `experimental_speed_projection`.
- Compatibilidad con APIs OpenAI (`/v1`) y Anthropic (`/v1/messages`) a través del servidor Strata.
- Capacidades multilingües: presentes pero degradadas respecto al modelo completo, según la advertencia de la model card.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo conserva el 91,3 % de la puntuación SWE-bench Verified del original, por lo que puede integrarse en pipelines que reciben un issue y un snapshot del repositorio y generan un parche. La poda sobre datos de agentes preserva el comportamiento de exploración multi-archivo.
- Asistencia a programación competitiva y generación de soluciones algorítmicas: mantiene el 98,7 % de LiveCodeBench v6, adecuado para entornos de evaluación automática donde la latencia importa y el contexto rara vez supera unos miles de tokens.
- Despliegue en estaciones de trabajo con una sola GPU consumer: con 58,4 GB de descarga y solo 29,6 GB del primer shard necesarios en memoria, cabe en configuraciones de 12 GB de VRAM más 32 GB de RAM según los requisitos declarados por Strata, lo que habilita inferencia local de un MoE de 116.500 millones de parámetros efectivos.
- Servidor interno compatible con SDK de OpenAI y Anthropic: al exponer `/v1` y `/v1/messages`, puede sustituir endpoints comerciales en herramientas existentes sin reescribir clientes.
- Análisis de capturas de pantalla y diagramas en flujos de revisión de código: el proyector de visión permite pasar imágenes junto a texto, útil para revisar PRs con mockups o informes de error visuales.
- Investigación sobre alineación y direcciones de rechazo: el repositorio sirve como banco de pruebas controlado, ya que la proyección se puede activar y desactivar en el mismo checkpoint para comparar comportamiento con y sin neutralización.
- Evaluación comparativa de técnicas de poda y cuantización: al conservar shards idénticos a la versión sin podar (tabla n-gram y proyector), permite aislar el efecto de la poda de expertos en benchmarks de código manteniendo el resto del pipeline constante.

## Benchmarks y rendimiento

| Benchmark | Resultado relativo al modelo completo | Fuente |
|---|---|---|
| SWE-bench Verified | 91,3 % de la puntuación del modelo completo | ISTA-DASLab (model card) |
| LiveCodeBench v6 | 98,7 % de la puntuación del modelo completo | ISTA-DASLab (model card) |

No se han publicado en la información disponible valores absolutos de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para esta variante podada. Los números absolutos de SWE-bench Verified y LiveCodeBench del modelo original se remiten al repositorio de ISTA-DASLab.

Mediciones de despliegue declaradas por el autor: en una RTX 3090 a 300 W, CPU EPYC 7642 (48 núcleos, AVX2 sin AVX-512) y 125 GB de RAM, con Strata 0.1.40 compilado para sm_86 y `--spec-min-p 0.7`, la tarjeta retuvo 8.524 de los 12.288 expertos con contexto de 65.536 tokens y 8.346 expertos con contexto de 262.144 tokens. No se proporcionan cifras de throughput en tokens por segundo.

## Requisitos de hardware

- VRAM mínima declarada: 12 GB o más, junto con 32 GB de RAM como mínimo para el runtime Strata.
- Descarga completa: 58,4 GB (dos shards); para arrancar solo hace falta el primer shard de 29,6 GB en memoria.
- GPU probada: NVIDIA RTX 3090 (sm_86) a 300 W; el runtime declara soporte para tarjetas NVIDIA y AMD.
- Cabe en GPU consumer de gama alta (3090, 4090, 5090) siempre que se combine con suficiente RAM de sistema; el autor reporta que a contextos largos parte de los expertos quedan fuera de VRAM y se sirven desde RAM.
- Despliegue recomendado: runtime Strata (build desde fuente o instalador, con `setup.sh` en Linux/macOS o `START-HERE.bat` en Windows).
- llama.cpp carga los GGUF, pero su `--control-vector` estándar suma el vector en lugar de proyectarlo, por lo que sin Strata el modelo se comporta como el original sin neutralización.
- Latencia y throughput: no disponibles en la información proporcionada; solo se documenta el uso de decodificación especulativa con capa MTP y `--spec-min-p 0.7`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Poda / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (abliterated GSQ-RCO Coder Strata) | 116.500 M efectivos (176.900 M originales) | Hasta 262.144 probado | 256/512 expertos, 3,5 bits | qwen-community-license-1.0 | GGUF en HF, runtime Strata |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | 116.500 M efectivos | No disponible en esta ficha | 256/512 expertos, 3,5 bits | qwen-community-license-1.0 | GGUF en HF |
| Qwen/Qwen3.8-Flash-Next (original) | 176.900 M | No disponible en esta ficha | Sin poda | qwen-community-license-1.0 | Checkpoint original en HF |
| Variantes sin podar IQ3_S (repo alesha-pro) | 176.900 M | No disponible en esta ficha | Sin poda, IQ3_S (83,6 GB) | qwen-community-license-1.0 | GGUF en HF |

La comparativa relevante es frente al modelo completo: la poda reduce el tamaño de descarga un 30,1 % (de 83,6 GB a 58,4 GB) a cambio de perder el 8,7 % en SWE-bench Verified y el 1,3 % en LiveCodeBench v6, con degradación adicional en idiomas distintos del inglés y en tareas fuera de código. Frente a la variante GSQ-RCO Coder de ISTA-DASLab, este repositorio añade la neutralización de rechazo vía Strata y la capa MTP para decodificación especulativa, manteniendo los pesos idénticos byte a byte (verificado por SHA256).

## Limitaciones y advertencias

- La poda de expertos degrada el rendimiento fuera del dominio de código: la propia model card indica que el modelo es más débil en tareas generales y que los idiomas distintos del inglés empeoran, según la página de Strata.
- Pérdida medida del 8,7 % en SWE-bench Verified y del 1,3 % en LiveCodeBench v6 respecto al modelo completo; no debe esperarse paridad en tareas agénticas complejas.
- La neutralización del rechazo elimina una capa de seguridad: el modelo puede producir contenido que el original rechazaría. Es responsabilidad del operador aplicar filtrado externo en producción.
- La proyección solo funciona en Strata; con llama.cpp estándar el vector se suma en lugar de proyectarse y el comportamiento vuelve al del modelo original, lo que puede generar confusión si se cambia de runtime.
- El autor declara no haber ejecutado el instalador de Strata de principio a fin en su máquina; construyó la versión 0.1.40 desde fuente. El flujo `setup.sh` puede presentar problemas no documentados.
- Requiere descargar una capa MTP adicional de unos 6 GB desde el checkpoint original de Qwen para la decodificación especulativa.
- A contextos largos (262.144 tokens) solo 8.346 de los 12.288 expertos caben en una RTX 3090, lo que implica tráfico a RAM y latencia adicional no cuantificada en la información disponible.
- Licencia qwen-community-license-1.0: revisar las condiciones de uso comercial y de redistribución antes de desplegar; el campo `license: other` en los tags requiere consultar el archivo LICENSE del repositorio.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo podado sobre datos de código, la fidelidad factual fuera de ese dominio es menor que la del original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las mediciones declaradas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orz99/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Coder-Strata-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Repositorio de variantes sin podar: https://huggingface.co/alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF
- Runtime Strata: https://github.com/Niko1221/Strata
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Código RCO: https://github.com/IST-DASLab/RCO
