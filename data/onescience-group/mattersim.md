# OneScience-Group/MatterSim

## Resumen

MatterSim es un potencial interatómico de aprendizaje profundo desarrollado por Microsoft Research y publicado en HuggingFace por OneScience-Group. Está diseñado para predecir energías y fuerzas atómicas en una amplia gama de elementos, temperaturas y presiones, cubriendo materiales inorgánicos, moléculas y sistemas periódicos. Se basa en una red neuronal de grafos equivariante, entrenada en múltiples conjuntos de datos de materiales y moléculas. Su relevancia radica en acelerar simulaciones de dinámica molecular y relajación de estructuras, ofreciendo una alternativa precisa y eficiente a los cálculos de primeros principios. El modelo está disponible bajo licencia MIT e incluye scripts para inferencia, relajación, dinámica molecular y fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos equivariante (GNN) |
| Parametros totales | No especificado (checkpoint: mattersim-v1.0.0-1M.pth) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de potencial interatómico) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) – no es un modelo de lenguaje |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

MatterSim utiliza una red neuronal de grafos equivariante (GNN) para modelar interacciones atómicas. Aunque no se detallan los hiperparámetros en la documentación disponible, se sabe que está entrenado en múltiples datasets de materiales y moléculas, abarcando una amplia variedad de elementos y condiciones termodinámicas. No se menciona el uso de RLHF ni DPO, ya que se trata de un modelo de regresión supervisada. La innovación principal es su capacidad para operar en un amplio rango de elementos, temperaturas y presiones, lo que lo hace versátil para simulaciones de materiales. El código de referencia está disponible en el repositorio oficial de Microsoft.

## Capacidades

- Predicción de energía y fuerzas atómicas para estructuras dadas.
- Inferencia por lotes para múltiples estructuras de forma eficiente.
- Relajación de estructuras (optimización de posiciones atómicas y celda) con algoritmos FIRE/BFGS.
- Dinámica molecular en el conjunto NVT.
- Fine-tuning sobre conjuntos de datos personalizados.
- Verificación de conectividad del entorno (para comprobar instalación y disponibilidad de CUDA/DCU).
- Soporte para una amplia gama de elementos, temperaturas y presiones.

## Casos de uso

- Diseño de nuevos materiales: predicción rápida de energías y fuerzas para cribar candidatos antes de simulaciones costosas.
- Catálisis heterogénea: simulación de superficies y adsorción de moléculas, optimizando geometrías mediante relajación de estructuras.
- Almacenamiento de energía: estudio de materiales para baterías, como electrodos y electrolitos, mediante dinámica molecular.
- Optimización de estructuras cristalinas: uso de relajación para predecir estructuras estables a partir de configuraciones iniciales.
- Fine-tuning para sistemas específicos: adaptación del modelo a un material o familia de materiales con datos propios.
- Integración en pipelines de simulación: uso como reemplazo de cálculos DFT para acelerar estudios de propiedades termodinámicas.
- Verificación de entornos de computación científica: los scripts de inferencia permiten comprobar la correcta instalación de CUDA/DCU en clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Se recomienda GPU o DCU (procesador de unidad de cómputo, como los de Hygon) para entrenamiento e inferencia.
- CPU es viable solo para pruebas pequeñas y verificación de importación.
- No se especifica VRAM mínima. Dado el tamaño del checkpoint (mattersim-v1.0.0-1M.pth), se espera que sea ligero y quepa en GPUs de consumo, pero no hay datos oficiales.
- Para DCU, se requiere DTK 25.04.2 o superior.
- Opciones de despliegue: scripts Python con PyTorch; se puede integrar en flujos personalizados.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Modelos similares en el campo de potenciales interatómicos incluyen MACE, NequIP y ANI, pero no se pueden comparar numéricamente sin benchmarks.

## Limitaciones y advertencias

- Es un modelo especializado en ciencia de materiales, no es un modelo de lenguaje.
- No se documentan sesgos específicos, pero el rendimiento puede degradarse en elementos o condiciones fuera del dominio de entrenamiento.
- El modelo puede requerir fine-tuning para alcanzar precisión en sistemas muy específicos.
- La licencia MIT permite uso comercial, pero se recomienda citar el paper original y los datasets usados.
- No se proporcionan garantías de precisión absoluta; validar con cálculos de referencia cuando sea crítico.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/MatterSim
- Repositorio de Microsoft: https://github.com/microsoft/mattersim
- Paper: *MatterSim: A deep-learning atomistic model across elements, temperatures, and pressures* (buscar en arXiv)
- OneScience GitHub: https://github.com/onescience-ai/OneScience
- OneScience Gitee: https://gitee.com/onescience-ai/onescience
- OneScience Skills GitHub: https://github.com/onescience-ai/oneskills
- OneScience Skills Gitee: https://gitee.com/onescience-ai/oneskills
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
