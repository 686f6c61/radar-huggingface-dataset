# NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC

## Resumen

NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC es una conversion del modelo Qwen/Qwen3-4B al formato q4f16_1 de MLC-LLM, orientado a su ejecucion en navegador mediante WebLLM con WebGPU. El autor, NellWatson, lo publica como verificacion de su pipeline de investigacion denominado CABAL, una reimplementacion independiente del cuantizador por grupos de MLC. No se trata de un modelo nuevo ni de un ajuste fino: es una redistribucion del mismo modelo base con pesos cuantizados.

La relevancia tecnica del artefacto es acotada. Segun la propia model card, los 435 tensores del repositorio son byte a byte identicos a los de mlc-ai/Qwen3-4B-q4f16_1-MLC en la revision a5c9fab8, y reutiliza la configuracion, el tokenizador y el layout de tensores de ese build oficial, cargandose con su biblioteca WebGPU precompilada. El autor recomienda explicitamente usar la version de mlc-ai para cualquier uso real.

Por tanto, esta ficha describe principalmente el modelo subyacente Qwen3-4B en su empaquetado q4f16_1 para WebLLM. El modelo base es un transformer denso de 4 mil millones de parametros de la familia Qwen3 de Alibaba, con licencia Apache 2.0, pensado para generacion de texto, razonamiento y codigo en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B); empaquetado para MLC-LLM / WebLLM |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende de la configuracion del build mlc-ai referenciado) |
| Tipos de cuantizacion | q4f16_1 (grupo de 4 bits con activaciones en float16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato MLC-LLM (biblioteca WebGPU precompilada del build mlc-ai); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de 4 mil millones de parametros desarrollado por el equipo Qwen de Alibaba. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card original de Qwen/Qwen3-4B, que no se incluye en el material disponible.

La innovacion del artefacto reside en el pipeline de conversion, no en el modelo. La model card indica que el autor reimplemento de forma independiente el cuantizador por grupos de MLC (CABAL) y genero los pesos q4f16_1, verificando que los 435 tensores resultantes coinciden byte a byte con el build oficial de mlc-ai. El paquete se distribuye en el formato de MLC-LLM para WebLLM, que compila el grafo a WebGPU y ejecuta la inferencia en el navegador. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en el material disponible.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3-4B.
- Generacion de codigo y resolucion de problemas matematicos, segun las capacidades declaradas por la familia Qwen3 (no verificadas en esta ficha por ausencia de benchmarks).
- Inferencia en navegador mediante WebLLM y WebGPU, sin necesidad de servidor backend.
- Ejecucion local en el cliente, lo que permite despliegues con privacidad de datos por diseno.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada para este empaquetado.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion de pipelines de cuantizacion: el proposito declarado del repositorio es servir de control para el pipeline CABAL, comparando los tensores generados con el build oficial de mlc-ai. Es util para investigadores que validan reimplementaciones de cuantizadores por grupos.
- Demos interactivas en navegador: al cargarse con la biblioteca WebGPU precompilada de mlc-ai, permite montar una demo de chat con Qwen3-4B que se ejecuta integramente en el cliente, sin coste de servidor.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el navegador del usuario, los datos no salen del dispositivo, lo que encaja en escenarios de asistencia sobre documentos sensibles.
- Prototipado rapido de interfaces de IA: WebLLM facilita integrar un modelo de 4B en aplicaciones web para validar flujos de producto antes de invertir en infraestructura de servidor.
- Educacion y experimentacion: el tamano de 4B y el formato cuantizado permiten explorar el comportamiento de un LLM moderno en equipos sin GPU dedicada de datacenter.
- Evaluacion comparativa de empaquetados: util para medir diferencias de latencia y consumo de memoria entre el build oficial y conversiones alternativas en el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,3 GB, coherente con pesos q4f16_1 de un modelo de 4B; el consumo en ejecucion depende del runtime WebGPU y del contexto configurado (no disponible con precision).
- GPU recomendadas: cualquier GPU con soporte WebGPU estable; el build oficial de mlc-ai esta pensado para navegadores de escritorio con aceleracion grafica.
- Cabe en GPU de consumo: si, al ser una cuantizacion de 4 bits de un modelo de 4B; el limite practico lo marca la implementacion de WebGPU del navegador.
- Opciones de despliegue: WebLLM en navegador con la biblioteca WebGPU precompilada de mlc-ai/Qwen3-4B-q4f16_1-MLC; MLC-LLM como runtime subyacente. No se distribuye en GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no aplican directamente a este repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC | 4B | no disponible | MLC-LLM q4f16_1 | Apache 2.0 | Conversion de verificacion; tensores identicos al build oficial |
| mlc-ai/Qwen3-4B-q4f16_1-MLC | 4B | no disponible | MLC-LLM q4f16_1 | Apache 2.0 | Build oficial recomendado por el propio autor |
| Qwen/Qwen3-4B | 4B | no disponible | safetensors | Apache 2.0 | Modelo base original en precision completa |

## Limitaciones y advertencias

- El autor declara explicitamente que el repositorio es una comprobacion de su pipeline de investigacion y recomienda usar el build de mlc-ai para cualquier otro fin.
- Al ser byte a byte identico al build oficial, no aporta ninguna mejora de calidad, velocidad o capacidades respecto a mlc-ai/Qwen3-4B-q4f16_1-MLC.
- Depende de la configuracion, tokenizador y biblioteca WebGPU del build mlc-ai en la revision a5c9fab8; cambios en ese build pueden romper la compatibilidad.
- La cuantizacion q4f16_1 introduce perdida de precision frente al modelo en precision completa, con posible degradacion en tareas sensibles.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de fidelidad en este empaquetado.
- Sesgos conocidos del modelo base: no disponible en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Qwen3-4B y del build mlc-ai referenciado.
- El soporte WebGPU varia segun navegador y sistema operativo, lo que limita la portabilidad del despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC
- Arbol de archivos: https://huggingface.co/NellWatson/Qwen3-4B-cabal-base-q4f16_1-MLC/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Build oficial de referencia: https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC
