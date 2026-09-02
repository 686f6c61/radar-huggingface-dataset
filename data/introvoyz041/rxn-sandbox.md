# introvoyz041/rxn-sandbox

## Resumen

RXN-Sandbox es un entorno local y ligero para ejecutar predicciones de reacciones químicas basadas en modelos transformer. Desarrollado por el equipo de RXN for Chemistry (rxn4chemistry), este repositorio permite realizar tres tareas principales: predicción de productos de reacción directa, retrosíntesis de un solo paso y generación de árboles de retrosíntesis. El modelo se distribuye como una instancia autocontenida que se despliega mediante contenedores Docker o Podman, lo que facilita su uso en entornos aislados sin depender de servicios en la nube.

La relevancia actual de esta herramienta radica en que ofrece capacidades de química computacional offline, con modelos entrenados con datos de Pistachio del segundo trimestre de 2025. Esto permite a investigadores y desarrolladores integrar predicciones de reacciones en flujos de trabajo locales, ya sea mediante notebooks Jupyter, scripts Python o a través de interfaces de LLM como OpenWebUI usando el protocolo MCP. El repositorio está disponible tanto en GitHub como en Hugging Face, con un tamaño de aproximadamente 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 |
| Formato de pesos | .ckpt (Checkpoint de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se basa en modelos transformer, aunque la documentación no especifica la variante exacta (p. ej., T5, BART o similar). Los modelos fueron entrenados con datos de reacciones químicas de la base de datos Pistachio correspondiente al segundo trimestre de 2025. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La implementación se apoya en Celery para la gestión de tareas asíncronas y en contenedores para el aislamiento del entorno.

## Capacidades

- Predicción de productos de reacción directa a partir de reactivos en formato SMILES.
- Retrosíntesis de un solo paso: dado un producto, predice los reactivos necesarios.
- Generación de árboles de retrosíntesis: rutas sintéticas multi-paso.
- Integración con LLMs mediante el protocolo MCP, permitiendo que modelos de lenguaje invoquen las predicciones químicas desde OpenWebUI.
- Ejecución local sin conexión a internet, con soporte para CPU y aceleración opcional por GPU NVIDIA.
- Interfaz interactiva mediante Jupyter Notebook y scripts Python dedicados.

## Casos de uso

- Diseño de rutas sintéticas en investigación farmacéutica: un químico puede introducir un producto objetivo y obtener varias rutas de retrosíntesis con sus respectivos reactivos, evaluando la viabilidad de cada paso.
- Validación de reacciones en química combinatoria: antes de ejecutar una reacción en laboratorio, se puede predecir el producto esperado y comparar con el resultado real.
- Automatización de flujos de trabajo en química computacional: integrar las predicciones en pipelines de análisis de datos mediante los scripts Python proporcionados.
- Asistencia a LLMs en tareas de química: mediante la integración MCP, un asistente conversacional puede consultar predicciones de reacciones en tiempo real y proporcionar respuestas fundamentadas.
- Educación y formación: el notebook Jupyter permite a estudiantes explorar conceptos de retrosíntesis y predicción de reacciones de forma interactiva.
- Optimización de condiciones de reacción: aunque no se menciona explícitamente, la predicción de productos puede ayudar a descartar rutas no viables antes de la experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM: 8 GB mínimo, 16 GB recomendado para predicciones de árboles de retrosíntesis.
- Disco: 10 GB libres para imágenes de contenedor y modelos.
- CPU: compatible con arquitecturas x86_64 y ARM64 (Apple Silicon).
- GPU: opcional, solo necesaria si se usa el archivo `compose-cuda.yaml` (requiere NVIDIA GPU y NVIDIA Container Toolkit).
- Despliegue: mediante Docker Compose o Podman Compose, con dos variantes: `compose.yaml` (CPU) y `compose-cuda.yaml` (GPU).
- Interfaces: Jupyter Notebook en el puerto 8888 y OpenWebUI en el puerto 3000.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen alternativas en el campo de la predicción de reacciones como Molecular Transformer o Chemformer, pero no se han encontrado datos de comparación directa con RXN-Sandbox en las fuentes consultadas.

## Limitaciones y advertencias

- La licencia openmdw-1.1 no es una licencia estándar de código abierto; se recomienda revisar sus términos antes de un uso comercial.
- El modelo está entrenado exclusivamente con datos en inglés y para química orgánica; su rendimiento en otros dominios químicos puede ser limitado.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo generativo, las predicciones deben validarse experimentalmente.
- La documentación no detalla la longitud de contexto ni los formatos de entrada/salida más allá de SMILES, lo que puede limitar su uso en moléculas muy grandes o complejas.
- El repositorio depende de Git LFS para los archivos de modelo (.ckpt), por lo que es necesario instalarlo antes de clonar.

## Enlaces

- Hugging Face: https://huggingface.co/introvoyz041/rxn-sandbox
- GitHub: https://github.com/rxn4chemistry/rxn-sandbox
- Repositorio original en Hugging Face: https://huggingface.co/rxn4chemistry/rxn-sandbox
